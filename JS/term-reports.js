
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   PRIVATE TERM REPORT MANAGEMENT
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const ADMIN_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

    const BUCKET = "term-reports";

    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    const form =
        document.getElementById("termReportForm");

    const message =
        document.getElementById("termReportMessage");

    const learnerSelect =
        document.getElementById("termReportLearner");

    const reportTable =
        document.getElementById("adminTermReportsTableBody");

    if (!db || !form || !message ||
        !learnerSelect || !reportTable) {

        console.error(
            "Term report management could not initialise."
        );

        return;

    }


    let submitting = false;


    // =====================================
    // DISPLAY MESSAGES
    // =====================================

    function showMessage(text, success) {

        message.textContent = text;

        message.style.color =
            success ? "#216638" : "#922E26";

    }


    // =====================================
    // VERIFY ADMINISTRATOR
    // =====================================

    async function verifyAdmin() {

        const { data, error } =
            await db.auth.getUser();

        if (
            error ||
            !data.user ||
            data.user.id !== ADMIN_ID
        ) {

            throw new Error(
                "Only the authorised school administrator can manage term reports."
            );

        }

        return data.user;

    }


    // =====================================
    // CREATE TABLE CELLS SAFELY
    // =====================================

    function addCell(row, value) {

        const cell =
            document.createElement("td");

        cell.textContent =
            value === null || value === undefined
                ? "-"
                : String(value);

        row.appendChild(cell);

    }


    // =====================================
    // LOAD LEARNERS
    // =====================================

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

        const placeholder =
            document.createElement("option");

        placeholder.value = "";

        placeholder.textContent =
            "Select a learner";

        learnerSelect.appendChild(placeholder);


        (data || []).forEach(function (learner) {

            const option =
                document.createElement("option");

            option.value = learner.id;

            option.textContent =
                learner.full_name +
                " — " +
                learner.grade +
                " (" +
                learner.admission_number +
                ")";

            learnerSelect.appendChild(option);

        });


        if (!data || data.length === 0) {

            showMessage(
                "No active learners are available.",
                false
            );

        }

    }


    // =====================================
    // LOAD SAVED REPORTS
    // =====================================

    async function loadReports() {

        const { data: reports, error } =
            await db
                .from("term_reports")
                .select(`
                    id,
                    learner_id,
                    academic_year,
                    term,
                    report_title,
                    original_file_name,
                    is_published,
                    created_at
                `)
                .order("created_at", {
                    ascending: false
                });

        if (error) throw error;


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


        reportTable.replaceChildren();


        if (!reports || reports.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 5;

            cell.textContent =
                "No term reports have been uploaded yet.";

            row.appendChild(cell);

            reportTable.appendChild(row);

            return;

        }


        reports.forEach(function (report) {

            const row =
                document.createElement("tr");

            addCell(
                row,
                learnerMap.get(report.learner_id) ||
                    "Learner unavailable"
            );

            addCell(row, report.academic_year);

            addCell(row, "Term " + report.term);

            addCell(row, report.report_title);

            addCell(
                row,
                report.is_published
                    ? "Published"
                    : "Draft"
            );

            reportTable.appendChild(row);

        });

    }


    // =====================================
    // VALIDATE PDF FILE
    // =====================================

    async function validatePdf(file) {

        if (!file) {

            throw new Error(
                "Please select a PDF report."
            );

        }

        if (file.size === 0) {

            throw new Error(
                "The selected file is empty."
            );

        }

        if (file.size > MAX_FILE_SIZE) {

            throw new Error(
                "The report exceeds the 5 MB file limit."
            );

        }

        if (!file.name.toLowerCase().endsWith(".pdf")) {

            throw new Error(
                "Only PDF files are accepted."
            );

        }

        if (
            file.type &&
            file.type !== "application/pdf"
        ) {

            throw new Error(
                "The selected file must be a PDF document."
            );

        }


        // CHECK THE FILE SIGNATURE

        const header =
            await file.slice(0, 5).text();

        if (header !== "%PDF-") {

            throw new Error(
                "The selected file does not appear to be a valid PDF."
            );

        }

    }


    // =====================================
    // CREATE SAFE STORAGE PATH
    // =====================================

    function createStoragePath(
        learnerId,
        year,
        term,
        fileName
    ) {

        const safeFileName =
            fileName
                .normalize("NFKD")
                .replace(/[^a-zA-Z0-9._-]/g, "_")
                .replace(/_+/g, "_")
                .replace(/^[_\.]+/, "")
                .slice(-100) || "report.pdf";


        return (
            learnerId +
            "/" +
            year +
            "/term-" +
            term +
            "/" +
            crypto.randomUUID() +
            "-" +
            safeFileName
        );

    }


    // =====================================
    // UPLOAD REPORT AND SAVE DATABASE RECORD
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
                    "Choose Save as Draft or Upload and Publish Report.",
                    false
                );

                return;

            }


            submitting = true;

            const buttons =
                form.querySelectorAll(
                    'button[type="submit"]'
                );

            buttons.forEach(button => {
                button.disabled = true;
            });


            let uploadedPath = null;


            try {

                // VERIFY ADMINISTRATOR

                const admin =
                    await verifyAdmin();


                // READ FORM DATA

                const learnerId =
                    learnerSelect.value;

                const year =
                    Number(
                        document.getElementById(
                            "termReportYear"
                        ).value
                    );

                const term =
                    Number(
                        document.getElementById(
                            "termReportTerm"
                        ).value
                    );

                const reportTitle =
                    document.getElementById(
                        "termReportTitle"
                    ).value.trim();

                const file =
                    document.getElementById(
                        "termReportFile"
                    ).files[0];


                // VALIDATE FORM DATA

                if (
                    !learnerId ||
                    !Number.isInteger(year) ||
                    year < 2000 ||
                    year > 2100 ||
                    !Number.isInteger(term) ||
                    term < 1 ||
                    term > 4 ||
                    !reportTitle
                ) {

                    throw new Error(
                        "Please complete all required report information."
                    );

                }


                await validatePdf(file);


                const publishing =
                    action === "publish";


                showMessage(
                    "Checking learner and report information...",
                    true
                );


                // CREATE A UNIQUE PRIVATE FILE PATH

                const storagePath =
                    createStoragePath(
                        learnerId,
                        year,
                        term,
                        file.name
                    );


                // =====================================
                // UPLOAD TO PRIVATE STORAGE
                // =====================================

                showMessage(
                    "Uploading PDF to private storage...",
                    true
                );


                const { error: uploadError } =
                    await db
                        .storage
                        .from(BUCKET)
                        .upload(
                            storagePath,
                            file,
                            {
                                cacheControl: "3600",
                                contentType: "application/pdf",
                                upsert: false
                            }
                        );


                if (uploadError) {
                    throw uploadError;
                }

                uploadedPath = storagePath;


                // =====================================
                // SAVE REPORT DATABASE RECORD
                // =====================================

                showMessage(
                    "Saving report information...",
                    true
                );


                const { error: databaseError } =
                    await db
                        .from("term_reports")
                        .insert({

                            learner_id: learnerId,

                            academic_year: year,

                            term: term,

                            report_title: reportTitle,

                            storage_path: storagePath,

                            original_file_name: file.name,

                            file_type: "application/pdf",

                            is_published: publishing,

                            published_at: publishing
                                ? new Date().toISOString()
                                : null,

                            uploaded_by: admin.id

                        });


                if (databaseError) {

                    // REMOVE ORPHANED STORAGE FILE

                    const { error: cleanupError } =
                        await db
                            .storage
                            .from(BUCKET)
                            .remove([storagePath]);

                    if (cleanupError) {

                        console.error(
                            "Storage cleanup failed:",
                            cleanupError
                        );

                    } else {

                        uploadedPath = null;

                    }

                    throw databaseError;

                }


                // SUCCESS

                uploadedPath = null;

                form.reset();

                document.getElementById(
                    "termReportYear"
                ).value =
                    new Date().getFullYear();


                try {

                    await loadReports();

                } catch (refreshError) {

                    console.error(
                        "Report register refresh failed:",
                        refreshError
                    );

                    showMessage(
                        "Report uploaded successfully, but the register could not refresh. Reload the page to check it.",
                        true
                    );

                    return;

                }


                showMessage(
                    publishing
                        ? "Term report successfully uploaded and published."
                        : "Term report successfully uploaded as a draft.",
                    true
                );


            } catch (error) {

                console.error(
                    "Term report upload failed:",
                    error
                );


                // CLEAN UP FILE IF DATABASE OPERATION FAILED

                if (uploadedPath) {

                    const { error: cleanupError } =
                        await db
                            .storage
                            .from(BUCKET)
                            .remove([uploadedPath]);

                    if (cleanupError) {

                        console.error(
                            "Could not clean up uploaded file:",
                            cleanupError
                        );

                    }

                }


                showMessage(
                    error.message ||
                        "Unable to upload the term report.",
                    false
                );

            } finally {

                submitting = false;

                buttons.forEach(button => {
                    button.disabled = false;
                });

            }

        }
    );


    // =====================================
    // INITIALISE AFTER ADMIN AUTHENTICATION
    // =====================================

    let initialising = false;

    async function initialise() {

        if (initialising) return;

        initialising = true;

        try {

            await verifyAdmin();

            await loadLearners();

            await loadReports();

            showMessage(
                "Private term report management connected successfully.",
                true
            );

        } catch (error) {

            console.error(
                "Term report initialisation failed:",
                error
            );

            showMessage(
                error.message ||
                    "Unable to initialise term report management.",
                false
            );

        } finally {

            initialising = false;

        }

    }


    // INITIAL LOAD

    initialise();


    // RELOAD AFTER ADMIN SIGN-IN

    db.auth.onAuthStateChange(
        function (event, session) {

            if (
                session?.user?.id === ADMIN_ID &&
                (
                    event === "SIGNED_IN" ||
                    event === "INITIAL_SESSION" ||
                    event === "TOKEN_REFRESHED"
                )
            ) {

                Promise.resolve().then(initialise);

            }

        }
    );


})();
