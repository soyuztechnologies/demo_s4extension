const cds = require('@sap/cds');

module.exports = cds.service.impl(async function(srv){
    const { MySalesOrder } = this.entities;
    
    var getAllSalesOrders= async function (){
        const { salesOrderService } = require('./sales-order-api/sales-order-service');
        const { salesOrderApi } =  salesOrderService();
        const salesorders = await salesOrderApi.requestBuilder().getAll().top(5)
        .execute({
            destinationName: "S4HANA"
          });
        //   {
        //     "url": "http://103.207.171.202:8021/",
        //     "username": "",
        //      "password": ""
        //   }
        console.log(salesorders)  ;
        return salesorders;
    };

    srv.on('READ', 'MySalesOrder', async(req) => {
        console.log("Call has come to read Sales Data, we are sending it to S/4HANA Now");

        return await getAllSalesOrders()
        .then(SalesOrderTable => {
            var aRecords = [];
            SalesOrderTable.forEach(element => {
                var item = {};
                item.SalesOrder = element.salesOrder;
                item.SalesOrganization = element.salesOrganization;
                item.SalesOrderType = element.salesOrderType;
                item.SalesOrderDate = element.salesOrderDate;
                item.SoldToParty = element.soldToParty;
                //item.OverallTotalDeliveryStatus = element.overallTotalDeliveryStatus;
                item.PaymentMethod = element.paymentMethod;
                item.Material = element.toItem.Material;
                item.RequestedQuantity = element.toItem.RequestedQuantity;
                item.NetAmount = element.toItem.NetAmount;
                aRecords.push(item);
            });
            return aRecords;
        });
    })

});