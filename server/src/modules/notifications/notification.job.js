const notificationService =
    require("./notification.service");


// Run once when the server starts
const startNotificationJobs = async () => {

    await notificationService
        .runExpiryNotificationCheck();


    // Run every 24 hours

    setInterval(

        async () => {

            await notificationService
                .runExpiryNotificationCheck();

        },

        24 * 60 * 60 * 1000

    );

};


module.exports = {
    startNotificationJobs
};