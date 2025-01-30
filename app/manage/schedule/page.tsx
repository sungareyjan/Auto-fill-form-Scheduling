"use client"; // If using the app directory in Next.js
import React, { useEffect, useState } from "react";
import { ref, set, push, onValue, update, remove, get, query, orderByChild, equalTo } from "firebase/database";
import { database } from "../../firebase/config"; // Import your Firebase configuration
import Modal from "../../component/modal";
import SelectComponent from "../../component/SelectComponent";
import FloatingInput from "@/app/component/textInput";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton, Pagination } from "@mui/material";
interface Schedule {
    id: string;
    [key: string]: any; // Adjust to reflect the structure of your user data
}

export default function Schedule() {
    const [data, setData] = useState<Schedule[]>([]); // Store fetched data
    const [optionEmail, setOptionEmail] = useState<
        { value: string; label: string; clinician: string }[]
    >([]);
    const [optionDayAndTime, setOptionDayAndTime] = useState<
        { value: string; label: string }[]
    >([]);
    const [DayAndTime, setDayAndTime] = useState<
        { value: string; label: string }[]
    >([]);
    console.log(DayAndTime)

    const [selectedEmail, setSelectedEmail] = useState<string | string[] | null>(null);
    const [selectedDayAndTime, setSelectedDayAndTime] = useState<string | string[] | null>(null);
    const [selectedType, setSelectedType] = useState<string | string[] | null>(null);
    const [clinician, setClinician] = useState("");
    const [clinicLevel, setClinicLevel] = useState("");
    const [procedures, setProcedures] = useState("");
    const [patient, setPatient] = useState("");
    const [dateOfOD, setDateOfOD] = useState("");

    const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        const usersRef = ref(database, "links");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>; // Ensure type safety
                const formattedOptions = Object.entries(fetchedData).map(([id, value]) => ({
                    value: value.link,
                    label: value.schedule_day,
                }));
                setDayAndTime(formattedOptions);
                console.log(formattedOptions)
                setOptionDayAndTime(formattedOptions);
            } else {
                console.log("No data available.");
            }
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const usersRef = ref(database, "clinician");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>; // Ensure type safety
                const formattedOptions = Object.entries(fetchedData).map(([id, value]) => ({
                    value: value.email,
                    label: value.email,
                    clinician: value.clinician,
                }));
                setOptionEmail(formattedOptions);
            } else {
                console.log("No data available.");
            }
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);

    // Get schecdule and Fill Table 
    useEffect(() => {
        const usersRef = ref(database, "schedule");

        const unsubscribe = onValue(usersRef, (snapshot) => {
            if (snapshot.exists()) {
                const fetchedData = snapshot.val() as Record<string, any>; // Ensure type safety
                const formattedData: Schedule[] = Object.entries(fetchedData).map(([id, value]) => ({
                    id,
                    ...value,
                }));
                setData(formattedData);
            } else {
                console.log("No data available.");
                setData([]);
            }
        });

        // Cleanup listener on component unmount
        return () => unsubscribe();
    }, []);


    // Create a new schedule
    async function createUser(e: any) {
        e.preventDefault();
        const usersRef = ref(database, "schedule");
        const newUserRef = push(usersRef); // Generate a unique ID
        if (!selectedDayAndTime || !selectedType || !selectedEmail || !clinicLevel || !procedures || !patient) {
            alert("Please fill all fields.");
            return;
        }
        try {
            await set(newUserRef, {
                email: selectedEmail,
                type: selectedType,
                schedule_day: selectedDayAndTime,
                clinician: clinician,
                clinic_level: clinicLevel,
                procedures: procedures,
                patient: patient,
                date_of_od: dateOfOD,
                status: "Pending",
            });
            console.log("User created with ID:", newUserRef.key);

            setModalOpen(false);
            setErrorMessage("");
            setSelectedType("");
            setSelectedDayAndTime("");
            setSelectedEmail("");
            setClinician("");
            setClinicLevel("");
            setProcedures("");
            setPatient("");
            setDateOfOD("");

        } catch (error) {
            console.log("Error adding link:", error);
        }
    }

    // Update an existing schedule
    async function updateSchedule(e: any) {
        e.preventDefault();
        if (!selectedDayAndTime || !selectedType || !selectedEmail || !clinicLevel || !procedures || !patient) {
            alert("Please fill all fields.");
            return;
        }

        const userRef = ref(database, `schedule/${selectedId}`);
        if (!dateOfOD) {
            console.log(dateOfOD);
        }
        await update(userRef, {
            email: selectedEmail,
            type: selectedType,
            schedule_day: selectedDayAndTime,
            clinician: clinician,
            clinic_level: clinicLevel,
            procedures: procedures,
            patient: patient,
            date_of_od: dateOfOD,
        });
        setUpdateModalOpen(false);
        setErrorMessage("");
        setSelectedType("");
        setSelectedDayAndTime("");
        setSelectedEmail("");
        setClinician("");
        setClinicLevel("");
        setProcedures("");
        setPatient("");
    }

    // Delete a schedule
    async function deleteUser(id: string) {
        const userRef = ref(database, `schedule/${id}`);
        await remove(userRef);
        console.log("User deleted:", id);
    }

    const [isModalOpen, setModalOpen] = useState(false);

    function handleSchedule(selectedValue: any) {
        const usersRef = ref(database, "links");
        const restoQuery = query(usersRef, orderByChild("type"), equalTo(selectedValue));
        setOptionDayAndTime([]);
        return get(restoQuery)
            .then((snapshot) => {
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    console.log(data)
                    const formattedOptions = Object.entries(data).map(([id, value]: [string, any]) => ({
                        value: value.link,
                        label: value.schedule_day,
                    }));
                    setOptionDayAndTime(formattedOptions);
                    setSelectedType(selectedValue);
                    return formattedOptions; // Return the array
                } else {
                    console.log("No links with type found.");
                    return [];
                }
            })
            .catch((error) => {
                console.error("Error fetching links:", error);
                return [];
            });
    }

    function handleEmail(selectedValue: any) {
        console.log(optionEmail);
        setSelectedEmail(selectedValue);
        optionEmail.map((option) => {
            if (option.value === selectedValue) {
                setClinician(option.clinician);
            }
        });
    }

    function handleCloseModal() {
        setModalOpen(false);
        setUpdateModalOpen(false);
        setErrorMessage("");
        setSelectedType("");
        setSelectedDayAndTime("");
        setSelectedEmail("");
        setClinician("");
        setClinicLevel("");
        setProcedures("");
        setPatient("");
        setDateOfOD("");
    }


    const columns = [
        { id: "email", label: "Email" },
        { id: "type", label: "Type" },
        { id: "schedule_day", label: "Schedule Day" },
        { id: "clinician", label: "Clinician" },
        { id: "clinic_level", label: "Clinic Level" },
        { id: "procedures", label: "Procedures" },
        { id: "patient", label: "Patient" },
        { id: "date_of_od", label: "Date of OD" },
        { id: "status", label: "Status" },
    ];
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Filtered data
    const filteredData = data.filter((row) =>
        Object.values(row).some(
            (value) =>
                typeof value === "string" &&
                value.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    // Calculate total pages
    const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));

    // Ensure `page` is always within bounds
    useEffect(() => {
        if (page > totalPages) {
            setPage(1);
        }
    }, [totalPages]);

    // Paginated Data
    const paginatedData = filteredData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleChangePage = (_event: React.ChangeEvent<unknown>, newPage: number) => {
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
            setPage(newPage);
        }
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };
    return (
        <div className="grid grid-rows-[20px_1fr_20px] justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
            <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">

                <div className="bg-gray-800 p-5 rounded-lg  shadow-md text-left rtl:text-right text-gray-100 dark:text-gray-100">
                    <div className="flex flex-row gap-5 mb-4">

                        <div className=" p-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="border p-2 rounded w-full "
                            />
                        </div>

                        <div className="p-2 text-gray-100">
                            <span>Rows per page:</span>
                            <select value={rowsPerPage} onChange={handleChangeRowsPerPage} className="border p-1 rounded text-gray-600">
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                            <span>Page {page} of {totalPages}</span>
                        </div>
                        <button
                            className="px-3 text-xs font-medium text-center text-white bg-green-700 rounded-lg hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300"
                            onClick={() => setModalOpen(true)}
                        >
                            Add
                        </button>
                    </div>
                    <TableContainer>
                        <Table>
                            <TableHead >
                                <TableRow sx={{ "& td, & th": { color: "#9CA3AF" } }}>
                                    <TableCell>#</TableCell>
                                    {columns.map((col) => (
                                        <TableCell key={col.id}>{col.label}</TableCell>
                                    ))}
                                    <TableCell>Action</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {paginatedData.map((row, index) => {
                                    const userScheduleDays = Array.isArray(row.schedule_day) ? row.schedule_day : [row.schedule_day];
                                    const matchedSchedules = DayAndTime.filter(day => userScheduleDays.includes(day.value)).map(day => day.label).join(", ");

                                    return (
                                        <TableRow sx={{ "& td, & th": { color: "#9CA3AF" } }} key={row.id}>
                                            <TableCell>{index + 1}</TableCell>
                                            <TableCell>{row.email}</TableCell>
                                            <TableCell>{row.type}</TableCell>
                                            <TableCell>{matchedSchedules}</TableCell>
                                            <TableCell>{row.clinician}</TableCell>
                                            <TableCell>{row.clinic_level}</TableCell>
                                            <TableCell>{row.procedures}</TableCell>
                                            <TableCell>{row.patient}</TableCell>
                                            <TableCell>{row.date_of_od}</TableCell>
                                            <TableCell>    <span
                                                    style={{
                                                    backgroundColor: row.status === "Success" ? "#16A34A" : row.status === "Pending" ? "#049DD9" : "#DC2626",
                                                    color: "white",
                                                    padding: "5px 10px",
                                                    borderRadius: "5px",
                                                    fontWeight: "bold"
                                                    }}
                                                >
                                                    {row.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <IconButton
                                                    color="primary"
                                                    onClick={() => {
                                                        setUpdateModalOpen(true);
                                                        setSelectedType(row.type);
                                                        setSelectedDayAndTime(userScheduleDays);
                                                        setSelectedEmail(row.email);
                                                        setClinician(row.clinician);
                                                        setClinicLevel(row.clinic_level);
                                                        setProcedures(row.procedures);
                                                        setPatient(row.patient);
                                                        setDateOfOD(row.date_of_od);
                                                        setSelectedId(row.id);
                                                    }}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => deleteUser(row.id)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination Controls */}
                    <div className="flex flex-row-reverse gap-2  text-gray-100 p-2">
                        {/* MUI Pagination with square styling */}
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handleChangePage}
                            sx={{
                                "& .MuiPaginationItem-root": {
                                    borderRadius: "0px",
                                    border: "1px solid #ddd",
                                    padding: "8px 12px",
                                    margin: "0 4px",
                                    color: "white",
                                },
                                "& .Mui-selected": {
                                    backgroundColor: "#4CAF50",
                                    color: "white",
                                    border: "1px solid #4CAF50",
                                },
                            }}
                            className="rounded-none"
                        />
                    </div>

                </div>

                <Modal title={'Add For Schedule'} isOpen={isModalOpen} onClose={handleCloseModal}>
                    <span className="text-red-600 text-sm">{errorMessage}</span>
                    <form className="max-w-md mx-auto">
                        <SelectComponent
                            options={[
                                { value: "Resto", label: "Resto" },
                                { value: "PROSTHO", label: "PROSTHO" },
                            ]}
                            placeholder="Select Type"
                            label="Type"
                            multiple={false}
                            onChange={(selectedValue) => handleSchedule(selectedValue)}
                            value={''}
                        />
                        <SelectComponent
                            options={optionDayAndTime}
                            placeholder="Select Day and Time"
                            label="Day and Time"
                            multiple={true}
                            onChange={(selectedValue) => setSelectedDayAndTime(selectedValue)}
                            value={selectedDayAndTime}
                        />
                        <SelectComponent
                            options={optionEmail}
                            placeholder="Select Email"
                            label="Email"
                            multiple={false}
                            onChange={(selectedValue) => handleEmail(selectedValue)}
                            value={selectedEmail}
                        />

                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" value={clinician} id="floating_last_name" className="input-text peer" placeholder=" " disabled />
                            <label htmlFor="floating_last_name" className="label-text" >Clinician</label>
                        </div>

                        <FloatingInput
                            id="clinic_level"
                            name="clinic_level"
                            label="Clinic Level"
                            value={clinicLevel}
                            onChange={(e) => setClinicLevel(e.target.value)}
                            required
                        />

                        <FloatingInput
                            id="procedure"
                            name="procedure"
                            label="Procedure"
                            value={procedures}
                            onChange={(e) => setProcedures(e.target.value)}
                            required
                        />
                        <FloatingInput
                            id="patient"
                            name="patient"
                            label="Patient"
                            value={patient}
                            onChange={(e) => setPatient(e.target.value)}
                            required
                        />
                        <FloatingInput
                            id="date_of_od"
                            name="date_of_od"
                            label="Date Of OD"
                            value={dateOfOD}
                            onChange={(e) => setDateOfOD(e.target.value)}
                        />
                        <div className="flex justify-center">
                            <button type="submit" className="btn-green flex " onClick={createUser}>Submit</button>
                        </div>
                    </form>
                </Modal>

                <Modal title={'Update For Schedule'} isOpen={isUpdateModalOpen} onClose={handleCloseModal}>
                    <span className="text-red-600 text-sm">{errorMessage}</span>
                    <form onSubmit={updateSchedule} className="max-w-md mx-auto">
                        <SelectComponent
                            options={[
                                { value: "Resto", label: "Resto" },
                                { value: "PROSTHO", label: "PROSTHO" },
                            ]}
                            placeholder="Select Type"
                            label="Type"
                            multiple={false}
                            onChange={(selectedValue) => handleSchedule(selectedValue)}
                            value={selectedType}
                        />
                        <SelectComponent
                            options={optionDayAndTime}
                            placeholder="Select Day and Time"
                            label="Day and Time"
                            multiple={true}
                            onChange={(selectedValue) => setSelectedDayAndTime(selectedValue)}
                            value={selectedDayAndTime}
                        />
                        <SelectComponent
                            options={optionEmail}
                            placeholder="Select Email"
                            label="Email"
                            multiple={false}
                            onChange={(selectedValue) => handleEmail(selectedValue)}
                            value={selectedEmail}
                        />

                        <div className="relative z-0 w-full mb-5 group">
                            <input type="text" name="floating_last_name" value={clinician} id="floating_last_name" className="input-text peer" placeholder=" " disabled />
                            <label htmlFor="floating_last_name" className="label-text" >Clinician</label>
                        </div>

                        <FloatingInput
                            id="clinic_level"
                            name="clinic_level"
                            label="Clinic Level"
                            value={clinicLevel}
                            onChange={(e) => setClinicLevel(e.target.value)}
                            required
                        />

                        <FloatingInput
                            id="procedure"
                            name="procedure"
                            label="Procedure"
                            value={procedures}
                            onChange={(e) => setProcedures(e.target.value)}
                            required
                        />
                        <FloatingInput
                            id="patient"
                            name="patient"
                            label="Patient"
                            value={patient}
                            onChange={(e) => setPatient(e.target.value)}
                            required
                        />
                        <FloatingInput
                            id="date_of_od"
                            name="date_of_od"
                            label="Date Of OD"
                            value={dateOfOD}
                            onChange={(e) => setDateOfOD(e.target.value)}
                        />
                        <div className="flex justify-center">
                            <button type="submit" className="btn-green flex ">Submit</button>
                        </div>
                    </form>
                </Modal>
            </main>
        </div>
    )

}