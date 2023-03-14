console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
    const data = e.data.json();
    console.log("Push Recieved...");
    console.log("@@@", data)
    self.registration.showNotification(data.title, {
        body: data.msg,
    })
});

self.addEventListener("notificationclick", (e) => {
    e.notification.close();
    e.waitUntil(
        clients.openWindow("https://root.channel.io")
    )
})
