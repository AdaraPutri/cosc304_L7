const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

const dbConfig = {
    server: 'cosc304_sqlserver',
    database: 'orders',
    authentication: {
        type: 'default',
        options: {
            userName: 'sa',
            password: '304#sa#pw'
        }
    },
    options: {
        encrypt: false,
        enableArithAbort: false
    }
};

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    const orderId = req.query.orderId; // Retrieve orderId from query params
    const warehouseId = 1; // Example warehouseId

    if (!orderId) {
        res.write('Order ID is required.');
        res.end();
        return;
    }

    (async function() {
       
    let transaction;
        try {
          let pool = await sql.connect(dbConfig);

          transaction=new sql.Transaction(pool);

            await transaction.begin();

            // Validate if the order ID exists
            const orderResult = await transaction.request()
                .input('orderId', sql.Int, orderId)
                .query('SELECT * FROM ordersummary WHERE orderId = @orderId');

            if (orderResult.recordset.length === 0) {
                throw new Error('Invalid Order ID');
            }

            // Retrieve all products and quantities for the given order
            const productsResult = await transaction.request()
                .input('orderId', sql.Int, orderId)
                .query(`
                    SELECT op.productId, op.quantity
                    FROM orderproduct op
                    WHERE op.orderId = @orderId
                `);

            if (productsResult.recordset.length === 0) {
                throw new Error('No products found for the given order.');
            }

            // Create a new shipment record
            const shipmentDate = moment().format('YYYY-MM-DD HH:mm:ss');
            const shipmentDesc = `Shipment for Order ID ${orderId}`;
            const insertShipment = await transaction.request()
                .input('shipmentDate', sql.VarChar, shipmentDate)
                .input('shipmentDesc', sql.VarChar, shipmentDesc)
                .input('warehouseId', sql.Int, warehouseId)
                .query(`
                    INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId)
                    OUTPUT INSERTED.shipmentId
                    VALUES (@shipmentDate, @shipmentDesc, @warehouseId)
                `);
            const shipmentId = insertShipment.recordset[0].shipmentId;

            // Verify inventory and update for each product
            for (const product of productsResult.recordset) {
                const inventoryResult = await transaction.request()
                    .input('productId', sql.Int, product.productId)
                    .input('warehouseId', sql.Int, warehouseId)
                    .query(`
                        SELECT quantity
                        FROM productInventory
                        WHERE productId = @productId AND warehouseId = @warehouseId
                    `);

                if (inventoryResult.recordset.length === 0) {
                    throw new Error(`Inventory not found for product ${product.productId}`);
                }

                const availableQuantity = inventoryResult.recordset[0].quantity;
                if (availableQuantity < product.quantity) {
                    throw new Error(availableQuantity+ `Insufficient inventory for product ${product.productId}`);
                }

                // Update inventory
                await transaction.request()
                    .input('productId', sql.Int, product.productId)
                    .input('warehouseId', sql.Int, warehouseId)
                    .input('quantity', sql.Int, product.quantity)
                    .query(`
                        UPDATE productInventory
                        SET quantity = quantity - @quantity
                        WHERE productId = @productId AND warehouseId = @warehouseId
                    `);
            }

            // Commit the transaction
            await transaction.commit();
            res.write(`Shipment created successfully with ID: ${shipmentId}`);
            res.end();
        } catch (err) {
            if (transaction && transaction._aborted !== true) {
                await transaction.rollback(); // Rollback the transaction on error
            }
            res.write(`Error: ${err.message}`);
            res.end();
        } 
    })();
});

module.exports = router;