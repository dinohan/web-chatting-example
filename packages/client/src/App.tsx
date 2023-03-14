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

const getVapidKey = async () => {
  const response = await fetch(`${SERVER_URL}/vapidPublicKey`);
  const data = await response.json();
  return data.data as string;
}

const postRegister = async () => {
  const response = await fetch(`${SERVER_URL}/register`, {
    method: "POST",
    headers: {
        "content-type": "application/json",
    },
  })
  const data = await response.json()
  return data.data.id as string
}

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) {
      return subscription
    }

    const vapidPublicKey = await getVapidKey()
    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    return await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });
  }
}

const postSubscription = async (user: string, subscription: PushSubscription) => {
  const response = await fetch(`${SERVER_URL}/subscription`, {
    method: 'post',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify({
      user: user,
      subscription: subscription
    }),
  });
  const data = await response.json()
  return data.data
}

const getUserFromQueryString = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('user');
}

function App() {
  const [user, setUser] = useState<string | null>(getUserFromQueryString)

  const handleSetUser = (user: string) => {
    setUser(user)
    // set query string
    window.history.pushState({}, '', `?user=${user}`);
  }

  useEffect(() => {
    postRegister()
      .then((user) => {
        handleSetUser(user)
        registerServiceWorker()
          .then((subscription) => {
            if (!subscription) { return }
            postSubscription(user, subscription)
          })
      })
  }, [])

  if (!user) {
    return null
  }

  return (
    <ChatRoom user={user}/>
  )
}

export default App