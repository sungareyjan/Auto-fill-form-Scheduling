"use client"; // If using the app directory in Next.js

import React, { useEffect, useState } from "react";
import { ref, set, push, onValue, update, remove } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration
import Modal from "../../component/modal";
import SelectComponent from "../../component/SelectComponent";
import FloatingInput from "@/app/component/textInput";

interface DayAndTime {
    id: string;
    [key: string]: any; // Adjust to reflect the structure of your user data
}

export default function DayAndTime() {
    const [data, setData] = useState<DayAndTime[]>([]); // Store fetched data
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setModalOpen] = useState(false); // For Add Modal
    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false); // For Update Modal
    const [schedule, setSchedule] = useState(""); // Store schedule day and time
    const [link, setLink] = useState(""); // Store link
    const [selectedStatus, setSelectedStatus] = useState<string | string[] | null>(null);
    const [selectedType, setSelectedType] = useState<string | string[] | null>(null);

    const [selectedId,setSelectedIdStatus] =useState();
    useEffect(() => {
        const usersRef = ref(database, "day_and_time");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>; // Ensure type safety
                const formattedData: DayAndTime[] = Object.entries(fetchedData).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setData(formattedData);
            } else {
                setData([]);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Add user
    async function createScheduleLink(e: any) {
        e.preventDefault();
        if (!schedule) {
            alert("Please fill all fields.");
            return;
        }
        try {
            const usersRef = ref(database, "day_and_time");
            const newUserRef = push(usersRef); // Generate a unique ID
            await set(newUserRef, {
                type: selectedType,
                schedule_day: schedule,
                link: link,
                status: selectedStatus,
            });
            setModalOpen(false); // Close modal after submission
        } catch (error) {
            console.error("Error adding user:", error);
        }
    }

    // Update user
    async function updateScheduleLink(e: any) {
        e.preventDefault();
        if (!selectedType) return;
        try {
            const userRef = ref(database, `day_and_time/${selectedId}`);
            await update(userRef, {
                type: selectedType,
                schedule_day: schedule,
                link: link, // Replace with updated link
                status: selectedStatus,
            });
            setUpdateModalOpen(false); // Close modal after update
        } catch (error) {
            console.error("Error updating user:", error);
        }
    }

    // Delete user
    async function deleteScheduleLink(id: string) {
        try {
            const userRef = ref(database, `day_and_time/${id}`);
            await remove(userRef);
        } catch (error) {
            console.error("Error removing user:", error);
        }
    }

    return (
        <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <button
                    className="px-3 py-2 text-xs font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300"
                    onClick={() => setModalOpen(true)}
                >
                    Add
                </button>

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
                            {data.map((user, index) => (
                                <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700" key={user.id}>
                                    <td className="px-6 py-4">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        {user.type && Array.isArray(user.type)
                                            ? user.type.map((type, index) => (
                                                <span key={index} className="inline-block mr-2 px-2 py-1 text-xs font-medium text-white bg-blue-600 rounded">
                                                    {type}
                                                </span>
                                            ))
                                            : user.type}
                                    </td>
                                    <td className="px-6 py-4">{user.schedule_day}</td>
                                    <td className="px-6 py-4">{user.link}</td>
                                    <td className="px-6 py-4">{user.status}</td>
                                    <td className="px-6 py-4 flex gap-2">
                                        <button
                                            className="btn-green"
                                            onClick={() => {
                                                setSelectedStatus(user.status);
                                                setSelectedType(user.type);
                                                setSchedule(user.schedule_day);
                                                setLink(user.link);
                                                setUpdateModalOpen(true);
                                                setSelectedIdStatus(user.id);
                                            }}
                                        >
                                            Update
                                        </button>
                                        <button className="btn-red" onClick={() => deleteScheduleLink(user.id)}>
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* Add Modal */}
                <Modal title="Add Schedule" isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
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
                        <FloatingInput
                            id="floating_last_name"
                            name="schedule_day"
                            label="Schedule Day and Time"
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
                <Modal title="Update Schedule" isOpen={isUpdateModalOpen} onClose={() => setUpdateModalOpen(false)}>
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

                        <FloatingInput
                            id="update_schedule_day"
                            name="schedule_day"
                            label="Schedule Day and Time"
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
