
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE ATTENDANCE MANAGEMENT
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const ADMIN_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

    const form =
        document.getElementById("attendanceForm");

    const message =
        document.getElementById("attendanceMessage");

    const learnerSelect =
        document.getElementById("attendanceLearner");

    const attendanceTable =
        document.getElementById("adminAttendanceTableBody");

    const submitButtons =
        form
            ? form.querySelectorAll('button[type="submit"]')
            : [];


    // CHECK REQUIRED CONNECTIONS

    if (
        !db ||
        !form ||
        !message ||
        !learnerSelect ||
        !attendanceTable
    ) {

        console.error(
            "Attendance management could not initialise."
        );

        return;

    }


    let submitting = false;


    // DISPLAY MESSAGES

    function showMessage(text, success) {

        message.textContent = text;

        message.style.color =
            success ? "#216638" : "#922E26";

    }


    // VERIFY ADMINISTRATOR

    async function verifyAdmin() {

        const { data, error } =
            await db.auth.getUser();

        if (
            error ||
            !data.user ||
            data.user.id !== ADMIN_ID
        ) {

            throw new Error(
                "Only the authorised school administrator can manage attendance."
            );

        }

        return data.user;

    }


    // SAFELY CREATE TABLE CELL

    function addCell(row, value) {

        const cell =
            document.createElement("td");

        cell.textContent =
            value === null || value === undefined
                ? "-"
                : String(value);

        row.appendChild(cell);

    }


    // CREATE DROPDOWN OPTION

    function addOption(select, value, text) {

        const option =
            document.createElement("option");

        option.value = value;
        option.textContent = text;

        select.appendChild(option);

    }


    // GET TODAY'S DATE IN LOCAL TIME

    function getLocalDate() {

        const now = new Date();

        const year = now.getFullYear();

        const month = String(
            now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
            now.getDate()
        ).padStart(2, "0");

        return year + "-" + month + "-" + day;

    }


    // LOAD REGISTERED LEARNERS

    async function loadLearners() {

        const { data, error } =
            await db
                .from("learners")
                .select(
                    "id, admission_number, full_name, grade"
                )
                .eq("learner_status", "Active")
                .order("full_name");

        if (error) throw error;


        learnerSelect.replaceChildren();

        addOption(
            learnerSelect,
            "",
            "Select a learner"
        );


        (data || []).forEach(function (learner) {

            addOption(
                learnerSelect,
                learner.id,
                learner.full_name +
                    " — " +
                    learner.grade +
                    " (" +
                    learner.admission_number +
                    ")"
            );

        });


        if (!data || data.length === 0) {

            showMessage(
                "No active learners are registered.",
                false
            );

        }

    }


    // LOAD ATTENDANCE RECORDS

    async function loadAttendance() {

        const { data, error } =
            await db
                .from("attendance_records")
                .select(`
                    id,
                    learner_id,
                    attendance_date,
                    status,
                    parent_note,
                    is_published
                `)
                .order("attendance_date", {
                    ascending: false
                });

        if (error) throw error;


        // LOAD LEARNER NAMES

        const { data: learners, error: learnerError } =
            await db
                .from("learners")
                .select("id, full_name");

        if (learnerError) throw learnerError;


        const learnerMap = new Map(
            (learners || []).map(learner => [
                learner.id,
                learner.full_name
            ])
        );


        attendanceTable.replaceChildren();


        if (!data || data.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 5;

            cell.textContent =
                "No attendance records have been entered yet.";

            row.appendChild(cell);

            attendanceTable.appendChild(row);

            return;

        }


        // DISPLAY RECORDS

        data.forEach(function (record) {

            const row =
                document.createElement("tr");

            addCell(
                row,
                learnerMap.get(record.learner_id) ||
                    "Learner unavailable"
            );

            addCell(
                row,
                record.attendance_date
            );

            addCell(
                row,
                record.status
            );

            addCell(
                row,
                record.parent_note || "-"
            );

            addCell(
                row,
                record.is_published
                    ? "Published"
                    : "Draft"
            );

            attendanceTable.appendChild(row);

        });

    }


    // =====================================
    // RECORD ATTENDANCE
    // =====================================

    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (submitting) return;


            const action =
                event.submitter?.value;

            if (
                action !== "draft" &&
                action !== "publish"
            ) {

                showMessage(
                    "Choose Save as Draft or Publish Attendance.",
                    false
                );

                return;

            }


            submitting = true;

            submitButtons.forEach(button => {
                button.disabled = true;
            });


            try {

                const admin =
                    await verifyAdmin();


                const learnerId =
                    learnerSelect.value;

                const attendanceDate =
                    document.getElementById(
                        "attendanceDate"
                    ).value;

                const status =
                    document.getElementById(
                        "attendanceStatus"
                    ).value;

                const parentNote =
                    document.getElementById(
                        "attendanceParentNote"
                    ).value.trim();


                // VALIDATE INFORMATION

                const validStatuses = [
                    "Present",
                    "Absent",
                    "Late",
                    "Excused"
                ];

                const today = getLocalDate();

                if (
                    !learnerId ||
                    !attendanceDate ||
                    !validStatuses.includes(status)
                ) {

                    throw new Error(
                        "Please select a learner, attendance date and valid status."
                    );

                }


                if (attendanceDate > today) {

                    throw new Error(
                        "Attendance cannot be recorded for a future date."
                    );

                }


                if (parentNote.length > 500) {

                    throw new Error(
                        "The parent note must not exceed 500 characters."
                    );

                }


                const publishing =
                    action === "publish";


                showMessage(
                    publishing
                        ? "Publishing attendance..."
                        : "Saving attendance as a draft...",
                    true
                );


                // SAVE TO SUPABASE

                const { error } =
                    await db
                        .from("attendance_records")
                        .insert({

                            learner_id:
                                learnerId,

                            attendance_date:
                                attendanceDate,

                            status:
                                status,

                            parent_note:
                                parentNote || null,

                            is_published:
                                publishing

                        });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "An attendance record already exists for this learner on that date. Duplicate records are not allowed."
                        );

                    }

                    throw error;

                }


                // RESET FORM

                form.reset();

                document.getElementById(
                    "attendanceDate"
                ).value = getLocalDate();


                // REFRESH REGISTER

                await loadAttendance();


                showMessage(
                    publishing
                        ? "Attendance successfully published to the Parent Portal."
                        : "Attendance successfully saved as a draft.",
                    true
                );


            } catch (error) {

                console.error(
                    "Attendance operation failed:",
                    error
                );

                showMessage(
                    error.message ||
                        "Unable to save the attendance record.",
                    false
                );

            } finally {

                submitting = false;

                submitButtons.forEach(button => {
                    button.disabled = false;
                });

            }

        }
    );


    // =====================================
    // INITIALISE ATTENDANCE MANAGEMENT
    // =====================================

    async function initialise() {

        try {

            await verifyAdmin();

            await loadLearners();

            await loadAttendance();

            document.getElementById(
                "attendanceDate"
            ).value = getLocalDate();

        } catch (error) {

            console.error(
                "Attendance management initialisation failed:",
                error
            );

            showMessage(
                error.message ||
                    "Unable to connect to attendance records.",
                false
            );

        }

    }


    initialise();


})();
