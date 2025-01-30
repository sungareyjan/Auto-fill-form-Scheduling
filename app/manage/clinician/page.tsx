"use client"; // If using the app directory in Next.js

import React, { useEffect, useState } from "react";
import { ref, set, get, push, onValue, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration
import Modal from "../../component/modal";
import SelectComponent from "../../component/SelectComponent";
import FloatingInput from "@/app/component/textInput";

interface Users {
    id: string;
    [key: string]: any; // Adjust to reflect the structure of your user data
}

export default function Users() {
    const [data, setData] = useState<Users[]>([]); // Store fetched data
    const [filteredData, setFilteredData] = useState<Users[]>([]); // Store filtered data for the search
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Search query state

    const [isModalOpen, setModalOpen] = useState(false); // For Add Modal
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false); // For Update Modal
    const [Clinician, setSchedule] = useState(""); // Store Clinician day and time
    const [email, setLink] = useState(""); // Store email
    const [selectedStatus, setSelectedStatus] = useState<string | string[] | null>(null);
    // const [selectedType, setSelectedType] = useState<string | string[] | null>(null);

    const [selectedId, setSelectedIdStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const dbRef = ref(database, "clinician");


    useEffect(() => {
        const readData = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>;
                const formattedData: Users[] = Object.entries(fetchedData).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setData(formattedData);
                setFilteredData(formattedData); // Initialize filtered data with all records
            } else {
                setData([]);
                setFilteredData([]);
            }
            setLoading(false);
        });

        return () => readData();
    }, []);

    // Handle search functionality
    useEffect(() => {
        if (searchQuery.trim() === "") {
            setFilteredData(data); // If no search query, show all data
        } else {
            const lowerCaseQuery = searchQuery.toLowerCase();
            setFilteredData(
                data.filter(
                    (item) =>
                        item.clinician?.toLowerCase().includes(lowerCaseQuery) ||
                        item.email?.toLowerCase().includes(lowerCaseQuery) ||
                        item.status?.toLowerCase().includes(lowerCaseQuery)
                )
            );
        }
    }, [searchQuery, data]);

        // Add user
        async function createScheduleLink(e: any) {
            e.preventDefault();
            if (!Clinician || !email || !selectedStatus) {
                alert("Please fill all fields.");
                return;
            }
            try {
                // Use `get()` for a one-time fetch
                const snapshot = await get(dbRef);
                if (snapshot.exists()) {
                    const existingLinks = Object.values(snapshot.val()).map((entry: any) => entry.email);
                    console.log(existingLinks);
                    if (existingLinks.includes(email)) {
                        setErrorMessage("The email already exists. Please use a different email.");
                        return;
                    }
                }
                // Add new entry if email is unique
                const newLinkRef = push(dbRef); // Generate a unique ID
                await set(newLinkRef, {
                    clinician: Clinician,
                    email: email,
                    status: selectedStatus,
                });
                setModalOpen(false); // Close modal after submission
                setSchedule("");
                setLink("");
                setSelectedStatus("");
            } catch (error) {
                console.error("Error adding clinician:", error);
            }
        }

        // Update clinician
        async function updateScheduleLink(e: any) {
            e.preventDefault();
            if (!Clinician || !email || !selectedStatus ) {
                alert("Please fill all fields.");
                return;
            }
            try {
                // Query the database to check if the email already exists, excluding the current entry
                const linkQuery = ref(database, `clinician`);
                const snapshot = await get(linkQuery);
                let linkExists = false;

                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    // Check if the email exists and the ID is not the same as the one being updated
                    if (data.email === email && childSnapshot.key !== selectedId) {
                        linkExists = true;
                    }
                });

                if (linkExists) {
                    setErrorMessage("The email already exists. Please use a different email.");
                    return;
                }

                // Proceed with the update if the email doesn't exist
                const userRef = ref(database, `clinician/${selectedId}`);
                await update(userRef, {
                    clinician: Clinician,
                    email: email, // Replace with updated email
                    status: selectedStatus,
                });

                // Reset error message and close the modal
                setErrorMessage("");
                setUpdateModalOpen(false);

            } catch (error) {
                console.error("Error updating user:", error);
            }
        }

        // Delete clinician
        async function deleteScheduleLink(id: string) {
            try {
                const linkRef = ref(database, `clinician/${id}`);
                await remove(linkRef);
            } catch (error) {
                console.error("Error removing clinician:", error);
            }
        }

        // Function to handle modal close
        function handleCloseModal() {
            setErrorMessage(""); // Clear the error message
            setUpdateModalOpen(false); // Close the modal
            setModalOpen(false);
        }
    return (
        <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                {/* Search Box */}

            <div className="flex justify-between grid md:grid-cols-2 md:gap-2">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="p-2 border rounded-md w-full sm:full"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                
                    <button
                        className=" w-full sm:w-1/2 px-3 py-2 text-xs font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300"
                        onClick={() => setModalOpen(true)}
                    >
                        Add
                    </button>
            </div>

                {/* Table displaying the clinician */}
                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">#</th>
                                <th scope="col" className="px-6 py-3">Clinician</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((user, index) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={user.id}>
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{user.clinician}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">{user.status}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            className="btn-green"
                                            onClick={() => {
                                                setSchedule(user.clinician);
                                                setLink(user.email);
                                                setSelectedStatus(user.status);
                                                setUpdateModalOpen(true);
                                                setSelectedIdStatus(user.id);
                                            }}
                                        >
                                             <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" />
                                        </svg>
                                        </button>
                                        <button className="btn-red" onClick={() => deleteScheduleLink(user.id)}>
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 7h14m-9 3v8m4-8v8M10 3h4a1 1 0 0 1 1 1v3H9V4a1 1 0 0 1 1-1ZM6 7h12v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7Z" />
                                        </svg>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}


                {/* Add Modal */}
                <Modal title="Add Clinician" isOpen={isModalOpen} onClose={handleCloseModal}>
                    <form onSubmit={createScheduleLink}>
                        <SelectComponent
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Deactivated", label: "Deactivated" },
                            ]}
                            placeholder="Select Status"
                            label="Status"
                            multiple={false} // Enable multiple selections
                            onChange={(selectedValue) => setSelectedStatus(selectedValue)} // Update the state
                            value={selectedStatus} // Bind the state to the component
                        />
                        <FloatingInput
                            id="floating_last_name"
                            name="clinician"
                            label="Clinician"
                            value={Clinician}
                            onChange={(e) => setSchedule(e.target.value)}
                            required
                        />
                        <span className="text-red-600 text-sm">{errorMessage}</span>
                        <FloatingInput
                            id="floating_last_name"
                            name="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setLink(e.target.value)}
                            required
                        />

                        <div className="flex justify-center">
                            <button type="submit" className="btn-green">
                                Submit
                            </button>
                        </div>
                    </form>
                </Modal>

                {/* Update Modal */}
                <Modal title="Update Clinician" isOpen={isUpdateModalOpen} onClose={handleCloseModal}>
                    <form onSubmit={updateScheduleLink}>
                        <SelectComponent
                            options={[
                                { value: "Active", label: "Active" },
                                { value: "Deactivated", label: "Deactivated" },
                            ]}
                            placeholder="Select "
                            label="Status "
                            value={selectedStatus} // Handle default value
                            onChange={(selectedValue) => setSelectedStatus(selectedValue)} // Update the state
                        />

                        <FloatingInput
                            id="update_schedule_day"
                            name="clinician"
                            label="Clinician"
                            value={Clinician}
                            onChange={(e) => setSchedule(e.target.value)}
                            required
                        />
                        <span className="text-red-600 text-sm">{errorMessage}</span>
                        <FloatingInput
                            id="update_link"
                            name="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setLink(e.target.value)}
                            required
                        />

                        <div className="flex justify-center">
                            <button type="submit" className="btn-green">
                                Update
                            </button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    );
}
