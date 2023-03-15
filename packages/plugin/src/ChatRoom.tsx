import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import NGROK_URL from '@dinohan/ngrok';

const socket = io(NGROK_URL.server);

function reverseArray<T>(array: T[]) {
  const reversedArray: T[] = [];
  for (let i = array.length - 1; i >= 0; i--) {
    reversedArray.push(array[i]);
  }
  return reversedArray;
}

function ChatRoom({
  userId,
}: {
  userId: string;
}) {
  const [messages, setMessages] = useState<{ userId: string, msg: string }[]>([]);
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    socket.on('msg', ({ userId, msg }: { userId: string, msg: string }) => {
      console.log('msg', userId, msg)
      setMessages((prevMessages) => [...prevMessages, { userId, msg }]);
    });

    return () => {
      socket.off('msg');
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inputValue) {
      socket.emit('write', { userId, msg: inputValue });
      setMessages((prevMessages) => [...prevMessages, { userId, msg: inputValue }]);
      setInputValue('');
    }
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setInputValue(event.target.value);
  }

  return (
    <div>
      <ul>
        {reverseArray(messages).map(({ userId, msg }, index) => (
          <li key={index}>{userId}: {msg}</li>
        ))}
      </ul>
      <form style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
      }} onSubmit={handleSubmit}>
        <input type="text" value={inputValue} onChange={handleInputChange} />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default ChatRoom;