import { useEffect, useState } from 'react'
import ChatRoom from './ChatRoom'
import { SERVER_URL } from './constansts';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function getVapidKey() {
  return fetch(`${SERVER_URL}/vapidPublicKey`).then(response => {
    return response.json()
  }).then(data => {
    return data.data
  })
}

function App() {
  const [user, setUser] = useState<string | undefined>(undefined)

  useEffect(() => {
    fetch(`${SERVER_URL}/register`, {
      method: "POST",
      headers: {
          "content-type": "application/json",
      },
    }).then(response => {
      return response.json()
    }).then(data => {
      setUser(data.data.id)
      return data.data.id
    }).then((user) => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('/service-worker.js')
          .then(function(registration) {
            return registration.pushManager.getSubscription()
              .then(async function(subscription) {
                // if (subscription) {
                //   return subscription;
                // }
  
                const vapidPublicKey = await getVapidKey()
                const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
  
                return registration.pushManager.subscribe({
                  userVisibleOnly: true,
                  applicationServerKey: convertedVapidKey
                });
              });
          })
          .then((subscription) => {
            console.log(subscription)
            fetch(`${SERVER_URL}/subscription`, {
              method: 'post',
              headers: {
                'Content-type': 'application/json'
              },
              body: JSON.stringify({
                user: user,
                subscription: subscription
              }),
            });
          });
      }
    })
  }, [])

  useEffect(() => {
    
  }, [])

  if (!user) {
    return null
  }

  return (
    <ChatRoom user={user}/>
  )
}

export default App