"use client"; // For app directory in Next.js

import React, { useState, useEffect } from "react";
import { database } from "../firebase/config"; // Import your database instance
import { ref, onValue } from "firebase/database";

export default function FirebaseConnectionStatus() {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    // Reference to the special ".info/connected" node
    const connectedRef = ref(database, ".info/connected");

    // Listen to connection changes
    const unsubscribe = onValue(connectedRef, (snapshot) => {
      if (snapshot.exists()) {
        setIsConnected(snapshot.val());
      } else {
        setIsConnected(false);
      }
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <h1>Firebase Connection Status</h1>
      {/* <h1>{process.env.API_KEY}</h1> */}
      <p>
        {isConnected === null
          ? "Checking connection..."
          : isConnected
          ? "Firebase is connected ✅"
          : "Firebase is not connected ❌"}
      </p>
    </div>
  );
}
