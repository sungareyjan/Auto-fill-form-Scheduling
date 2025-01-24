"use client"; // If using the app directory in Next.js

import React, { useEffect, useState } from "react";
import {  ref, set, push, onValue,  update, remove } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration
import Modal from "../../component/modal";
import SelectComponent from "../../component/SelectComponent";

interface Schedule {
    id: string;
    [key: string]: any; // Adjust to reflect the structure of your user data
}

const options = [
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'strawberry', label: 'Strawberry' },
    { value: 'vanilla', label: 'Vanilla' }
  ]
export default function Schedule() {
    const [data, setData] = useState<Schedule[]>([]); // Store fetched data
    const [loading, setLoading] = useState(true);


    const [selectedStatus, setSelectedStatus] = useState<string | string[] | null>(null);
    useEffect(() => {
        // Real-time listener to fetch data from the "users" node
        const usersRef = ref(database, "users");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>; // Ensure type safety
                const formattedData: Schedule[] = Object.entries(fetchedData).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                console.log(formattedData)
                setData(formattedData);
            } else {
                console.log("No data available.");
                setData([]);
            }
            setLoading(false);
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);


    // Create a new user
    async function createUser() {
        const usersRef = ref(database, "users");
        const newUserRef = push(usersRef); // Generate a unique ID
        await set(newUserRef, {
            name: "John Doe",
            email: "john.doe@example.com",
            type: "Resto",
            schedule_day: "Monday AM",
            clinician: "Jen",
            clinic_level: "Clinic 1",
            procedures: "Class V",
            patient: "Typodont",
            data_of_od: "NA",
            status: "success",
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

    const [isModalOpen, setModalOpen] = useState(false);

    const openModal  = () => setModalOpen(true);
    const closeModal = () => setModalOpen(false);

    let count = 1;


    return (
        <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

                <button className="px-3 py-2 text-xs font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" onClick={openModal}>Add</button>

                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">
                                #
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Email
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Schedule Day
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Clinician
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Clinic Level
                            </th>
                            <th scope="col" className="px-6 py-3">
                                PROCEDURES
                            </th>
                            <th scope="col" className="px-6 py-3">
                                PATIENT
                            </th>
                            <th scope="col" className="px-6 py-3">
                                DATE OF OD
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-3">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((user) => (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={user.id}>
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    {count++}
                                </th>
                                <td className="px-6 py-4">
                                    {user.email}
                                </td>
                                <td className="px-6 py-4">
                                    {user.type}
                                </td>
                                <td className="px-6 py-4">
                                    {user.schedule_day}
                                </td>
                                <td className="px-6 py-4">
                                    {user.clinician}
                                </td>
                                <td className="px-6 py-4">
                                    {user.clinic_level}
                                </td>
                                <td className="px-6 py-4">
                                    {user.procedures}
                                </td>
                                <td className="px-6 py-4">
                                    {user.patient}
                                </td>
                                <td className="px-6 py-4">
                                    {user.data_of_od}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="status-success"> {user.status}</span>
                                </td>
                                <td className="px-6 py-4 flex flex-row gap-2">
                                    <button type="button" className="btn-green" onClick={() => updateUser(user.id)}>Update</button>

                                    <button type="button" className="btn-red" onClick={() => deleteUser(user.id)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <Modal title={'Add For Schedule'} isOpen={isModalOpen} onClose={closeModal}>
                    <form className="max-w-md mx-auto">

                        <SelectComponent
                            options={[
                                { value: 'Monday AM', label: 'Monday AM' },
                                { value: 'TUESDAY AM', label: 'TUESDAY AM' },
                                ]}
                                placeholder="Select Day and Time"
                                label="Day and Time"
                                multiple={true} // Enable multiple selections
                                onChange={(selectedValue) => setSelectedStatus(selectedValue)} // Update the state
                                value={selectedStatus} // Bind the state to the component
                            />
                        <SelectComponent
                            options={[
                                { value: 'Resto', label: 'Resto' },
                                    { value: 'PROSTHO', label: 'PROSTHO' },
                                ]}
                                placeholder="Select Email"
                                label="Email"
                                multiple={false} // Enable multiple selections
                                onChange={(selectedValue) => setSelectedStatus(selectedValue)} // Update the state
                                value={selectedStatus} // Bind the state to the component
                            />

                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" id="floating_last_name" className="input-text peer" placeholder=" " disabled />
                            <label htmlFor="floating_last_name" className="label-text">Clinician</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" id="floating_last_name" className="input-text peer" placeholder=" " required />
                            <label htmlFor="floating_last_name" className="label-text">Clinic Level</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" id="floating_last_name" className="input-text peer" placeholder=" " required />
                            <label htmlFor="floating_last_name" className="label-text">Procedure</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" id="floating_last_name" className="input-text peer" placeholder=" " required />
                            <label htmlFor="floating_last_name" className="label-text">Patient</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" id="floating_last_name" className="input-text peer" placeholder=" " required />
                            <label htmlFor="floating_last_name" className="label-text">Date of OD</label>
                        </div>

                        {/* <div className="relative z-0 w-full mb-5 group">
                            <input type="password" name="floating_password" id="floating_password" className="input-password peer" placeholder=" " required />
                            <label htmlFor="floating_password" className="label-password">Password</label>
                        </div>
                        <div className="relative z-0 w-full mb-5 group">
                            <input type="password" name="repeat_password" id="floating_repeat_password" className="input-password peer" placeholder=" " required />
                            <label htmlFor="floating_repeat_password" className="label-password">Confirm password</label>
                        </div>
                        <div className="grid md:grid-cols-2 md:gap-6">
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="tel" pattern="[0-9]{3}-[0-9]{3}-[0-9]{4}" name="floating_phone" id="floating_phone" className="input-phone peer" placeholder=" " required />
                                <label htmlFor="floating_phone" className="label-phone">Phone number (123-456-7890)</label>
                            </div>
                            <div className="relative z-0 w-full mb-5 group">
                                <input type="text" name="floating_company" id="floating_company" className="input-text peer" placeholder=" " required />
                                <label htmlFor="floating_company" className="label-text">Company (Ex. Google)</label>
                            </div>
                        </div> */}
                        <div className="flex justify-center">
                                <button type="submit" className="btn-green flex " onClick={createUser}>Submit</button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    )

}