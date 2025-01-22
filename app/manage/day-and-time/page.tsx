"use client"; // If using the app directory in Next.js

import React, { useEffect, useState } from "react";
import { getDatabase, ref, set, push, onValue, get, update, remove } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration

export default function FirebaseCRUD() {
  const [data, setData] = useState([]); // Store fetched data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener to fetch data from the "users" node
    const usersRef = ref(database, "users");

    onValue(usersRef, (snapshot) => {
      if (snapshot.exists()) {
        const fetchedData = snapshot.val();
        const formattedData = Object.entries(fetchedData).map(([id, value]) => ({
          id,
          ...value,
        })); // Format data to include IDs
        setData(formattedData);
        setLoading(false);
      } else {
        console.log("No data available.");
        setData([]);
        setLoading(false);
      }
    });
  }, []);

  // Create a new user
  async function createUser() {
    const usersRef = ref(database, "users");
    const newUserRef = push(usersRef); // Generate a unique ID
    await set(newUserRef, {
      name: "John Doe",
      email: "john.doe@example.com",
      age: 30,
    });
    console.log("User created with ID:", newUserRef.key);
  }

  // Update an existing user
  async function updateUser(id) {
    const userRef = ref(database, `users/${id}`);
    await update(userRef, {
      name: "John Doe Updated",
      age: 35,
    });
    console.log("User updated:", id);
  }

  // Delete a user
  async function deleteUser(id) {
    const userRef = ref(database, `users/${id}`);
    await remove(userRef);
    console.log("User deleted:", id);
  }

  // Render the UI
  return (
    <div>
      <h1>Firebase CRUD Example</h1>

      {/* Create User */}
      <button onClick={createUser}>Create User</button>

      {loading ? (
        <p>Loading...</p>
      ) : data.length > 0 ? (
        <ul>
          {data.map((user) => (
            <li key={user.id}>
              <p>
                <strong>Name:</strong> {user.name} <br />
                <strong>Email:</strong> {user.email} <br />
                <strong>Age:</strong> {user.age} <br />
              </p>
              <button onClick={() => updateUser(user.id)}>Update</button>
              <button onClick={() => deleteUser(user.id)}>Delete</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No users available.</p>
      )}
    </div>
  );
}
