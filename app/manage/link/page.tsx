"use client"; // If using the app directory in Next.js

import React, { useEffect, useState } from "react";
import { ref, set, get, push, onValue, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration
import Modal from "../../component/modal";
import SelectComponent from "../../component/SelectComponent";
import FloatingInput from "@/app/component/textInput";

interface Link {
    id: string;
    [key: string]: any; // Adjust to reflect the structure of your link data
}

export default function Link() {
    const [data, setData] = useState<Link[]>([]); // Store fetched data
    const [filteredData, setFilteredData] = useState<Link[]>([]); // Store filtered data for the search
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(""); // Search query state

    const [isModalOpen, setModalOpen] = useState(false); // For Add Modal
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false); // For Update Modal
    const [schedule, setSchedule] = useState(""); // Store schedule day and time
    const [link, setLink] = useState(""); // Store link
    const [selectedStatus, setSelectedStatus] = useState<string | string[] | null>(null);
    const [selectedType, setSelectedType] = useState<string | string[] | null>(null);

    const [selectedId, setSelectedIdStatus] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const dbRef = ref(database, "links");


    useEffect(() => {
        const readData = onValue(dbRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>;
                const formattedData: Link[] = Object.entries(fetchedData).map(([id, value]) => ({
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
                        item.type?.toLowerCase().includes(lowerCaseQuery) ||
                        item.schedule_day?.toLowerCase().includes(lowerCaseQuery) ||
                        item.link?.toLowerCase().includes(lowerCaseQuery) ||
                        item.status?.toLowerCase().includes(lowerCaseQuery)
                )
            );
        }
    }, [searchQuery, data]);

        // Add link
        async function createScheduleLink(e: any) {
            e.preventDefault();
            if (!schedule || !link || !selectedStatus || !selectedType) {
                alert("Please fill all fields.");
                return;
            }
            try {
                // Use `get()` for a one-time fetch
                const snapshot = await get(dbRef);
                if (snapshot.exists()) {
                    const existingLinks = Object.values(snapshot.val()).map((entry: any) => entry.link);
                    console.log(existingLinks);
                    if (existingLinks.includes(link)) {
                        setErrorMessage("The link already exists. Please use a different link.");
                        return;
                    }
                }
                // Add new entry if link is unique
                const newLinkRef = push(dbRef); // Generate a unique ID
                await set(newLinkRef, {
                    type: selectedType,
                    schedule_day: schedule,
                    link: link,
                    status: selectedStatus,
                });
                setModalOpen(false); // Close modal after submission
            } catch (error) {
                console.error("Error adding link:", error);
            }
        }

        // Update link
        async function updateScheduleLink(e: any) {
            e.preventDefault();
            if (!schedule || !link || !selectedStatus || !selectedType) {
                alert("Please fill all fields.");
                return;
            }
            try {
                // Query the database to check if the link already exists, excluding the current entry
                const linkQuery = ref(database, `links`);
                const snapshot = await get(linkQuery);
                let linkExists = false;

                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    // Check if the link exists and the ID is not the same as the one being updated
                    if (data.link === link && childSnapshot.key !== selectedId) {
                        linkExists = true;
                    }
                });

                if (linkExists) {
                    setErrorMessage("The link already exists. Please use a different link.");
                    return;
                }

                // Proceed with the update if the link doesn't exist
                const userRef = ref(database, `links/${selectedId}`);
                await update(userRef, {
                    type: selectedType,
                    schedule_day: schedule,
                    link: link, // Replace with updated link
                    status: selectedStatus,
                });

                // Reset error message and close the modal
                setErrorMessage("");
                setUpdateModalOpen(false);

            } catch (error) {
                console.error("Error updating link:", error);
            }
        }

        // Delete link
        async function deleteScheduleLink(id: string) {
            try {
                const linkRef = ref(database, `links/${id}`);
                await remove(linkRef);
            } catch (error) {
                console.error("Error removing link:", error);
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

                {/* Table displaying the users */}
                {loading ? (
                    <div className="text-white">Loading...</div>
                ) : (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">#</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Schedule Day</th>
                                <th scope="col" className="px-6 py-3">Link</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                                <th scope="col" className="px-6 py-3">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((link, index) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={link.id}>
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">{link.type}</td>
                                    <td className="px-6 py-4">{link.schedule_day}</td>
                                    <td className="px-6 py-4">{link.link}</td>
                                    <td className="px-6 py-4">{link.status}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            className="btn-green"
                                            onClick={() => {
                                                setSelectedStatus(link.status);
                                                setSelectedType(link.type);
                                                setSchedule(link.schedule_day);
                                                setLink(link.link);
                                                setUpdateModalOpen(true);
                                                setSelectedIdStatus(link.id);
                                            }}
                                        >
                                            Update
                                        </button>
                                        <button className="btn-red" onClick={() => deleteScheduleLink(link.id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Add Modal */}
                <Modal title="Add Schedule" isOpen={isModalOpen} onClose={handleCloseModal}>
                    <form onSubmit={createScheduleLink}>
                        <div className="grid md:grid-cols-2 md:gap-6">
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

                            <SelectComponent
                                options={[
                                    { value: "Resto", label: "Resto" },
                                    { value: "PROTHOS", label: "PROTHOS" },
                                ]}
                                placeholder="Select Form Type"
                                label="Form Type"
                                multiple={false} // Enable multiple selections
                                onChange={(selectedValue) => setSelectedType(selectedValue)} // Update the state
                                value={selectedType} // Bind the state to the component
                            />
                        </div>
                        <FloatingInput
                            id="floating_last_name"
                            name="schedule_day"
                            label="Schedule Day and Time"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                            required
                        />
                        <span className="text-red-600 text-sm">{errorMessage}</span>
                        <FloatingInput
                            id="floating_last_name"
                            name="link"
                            label="Link"
                            value={link}
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
                <Modal title="Update Schedule" isOpen={isUpdateModalOpen} onClose={handleCloseModal}>
                    <form onSubmit={updateScheduleLink}>
                        <div className="grid md:grid-cols-2 md:gap-6">
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

                            <SelectComponent
                                options={[
                                    { value: "Resto", label: "Resto" },
                                    { value: "PROTHOS", label: "PROTHOS" },
                                ]}
                                placeholder="Select From Type"
                                label="Form Type"
                                value={selectedType} // Handle default value
                                onChange={(selectedValue) => setSelectedType(selectedValue)}
                            />
                        </div>
                        <FloatingInput
                            id="update_schedule_day"
                            name="schedule_day"
                            label="Schedule Day and Time"
                            value={schedule}
                            onChange={(e) => setSchedule(e.target.value)}
                            required
                        />
                        <span className="text-red-600 text-sm">{errorMessage}</span>
                        <FloatingInput
                            id="update_link"
                            name="Link"
                            label="Link"
                            value={link}
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
