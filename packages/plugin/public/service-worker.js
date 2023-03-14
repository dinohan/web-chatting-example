console.log("Service Worker Loaded...");

self.addEventListener("push", (e) => {
    const data = e.data.json();
    console.log("Push Recieved...");
    console.log("@@@", data)
    self.registration.showNotification(data.title, {
        body: data.msg,
        data,
    })
});

self.addEventListener("notificationclick", (e) => {
    e.notification.close();
    const url = e.notification.data.url;
    e.waitUntil(
        clients.openWindow(`/?user=${url}`)
    )
})
