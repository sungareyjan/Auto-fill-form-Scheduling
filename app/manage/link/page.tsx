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
    const [data, setData] = useState<Link[]>([]); 
    const [filteredData, setFilteredData] = useState<Link[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    const [isModalOpen, setModalOpen] = useState(false);
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [schedule, setSchedule] = useState("");
    const [link, setLink] = useState("");
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
                setFilteredData(formattedData);
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
            setFilteredData(data);
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
            const snapshot = await get(dbRef);
            if (snapshot.exists()) {
                const existingLinks = Object.values(snapshot.val()).map((entry: any) => entry.link);
                console.log(existingLinks);
                if (existingLinks.includes(link)) {
                    setErrorMessage("The link already exists. Please use a different link.");
                    return;
                }
            }
            const newLinkRef = push(dbRef); // Generate a unique ID
            await set(newLinkRef, {
                type: selectedType,
                schedule_day: schedule,
                link: link,
                status: selectedStatus,
            });
            setModalOpen(false);
            setSelectedType("");
            setSchedule("");
            setLink("");
            setSelectedStatus("");
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
            const linkQuery = ref(database, `links`);
            const snapshot = await get(linkQuery);
            let linkExists = false;

            snapshot.forEach((childSnapshot) => {
                const data = childSnapshot.val();
                if (data.link === link && childSnapshot.key !== selectedId) {
                    linkExists = true;
                }
            });

            if (linkExists) {
                setErrorMessage("The link already exists. Please use a different link.");
                return;
            }

            const userRef = ref(database, `links/${selectedId}`);
            await update(userRef, {
                type: selectedType,
                schedule_day: schedule,
                link: link,
                status: selectedStatus,
            });

            setErrorMessage("");
            setUpdateModalOpen(false);
            setSelectedType("");
            setSchedule("");
            setLink("");
            setSelectedStatus("");

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
        setErrorMessage("");
        setUpdateModalOpen(false);
        setModalOpen(false);
        setSelectedType("");
        setSchedule("");
        setLink("");
        setSelectedStatus("");
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
                    <table className="w-full text-sm  text-left rtl:text-right text-gray-500 dark:text-gray-400">
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
                                    <td className="px-6 py-4 ">{index + 1}</td>
                                    <td className="px-6 py-4">{link.type}</td>
                                    <td className="px-6 py-4 break-words whitespace-normal">{link.schedule_day}</td>
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
                                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.779 17.779 4.36 19.918 6.5 13.5m4.279 4.279 8.364-8.643a3.027 3.027 0 0 0-2.14-5.165 3.03 3.03 0 0 0-2.14.886L6.5 13.5m4.279 4.279L6.499 13.5m2.14 2.14 6.213-6.504M12.75 7.04 17 11.28" />
                                        </svg>
                                        </button>
                                        <button className="btn-red" onClick={() => deleteScheduleLink(link.id)}>
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
                                    { value: "PROSTHO", label: "PROSTHO" },
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
                                    { value: "PROSTHO", label: "PROSTHO" },
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
