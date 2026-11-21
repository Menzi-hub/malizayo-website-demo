
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE ACADEMIC RESULTS MANAGEMENT
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const ADMIN_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

    const form =
        document.getElementById("academicResultForm");

    const message =
        document.getElementById("academicResultMessage");

    const learnerSelect =
        document.getElementById("academicResultLearner");

    const resultsTable =
        document.getElementById("adminAcademicResultsTableBody");


    // CHECK REQUIRED ELEMENTS

    if (!db || !form || !message ||
        !learnerSelect || !resultsTable) {

        console.error(
            "Academic results management could not initialise."
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
                "Only the authorised school administrator can manage academic results."
            );

        }

        return data.user;

    }


    // FORMAT NUMBERS

    function formatNumber(value) {

        return Number(value).toLocaleString(
            "en-ZA",
            {
                maximumFractionDigits: 2
            }
        );

    }


    // CREATE SAFE TABLE CELL

    function addCell(row, value) {

        const cell = document.createElement("td");

        cell.textContent = String(value);

        row.appendChild(cell);

    }


    // LOAD REGISTERED LEARNERS

    async function loadLearners() {

        const { data, error } =
            await db
                .from("learners")
                .select(
                    "id, admission_number, full_name, grade"
                )
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
                "No registered learners were found. Register a learner first.",
                false
            );

        }

    }


    // LOAD SAVED RESULTS

    async function loadAcademicResults() {

        const { data, error } =
            await db
                .from("academic_results")
                .select(`
                    id,
                    learner_id,
                    academic_year,
                    term,
                    subject,
                    assessment_name,
                    mark_obtained,
                    total_marks,
                    is_published
                `)
                .order("created_at", {
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


        resultsTable.replaceChildren();


        if (!data || data.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 7;

            cell.textContent =
                "No academic results have been recorded yet.";

            row.appendChild(cell);

            resultsTable.appendChild(row);

            return;

        }


        data.forEach(function (result) {

            const row =
                document.createElement("tr");

            const percentage =
                (
                    Number(result.mark_obtained) /
                    Number(result.total_marks)
                ) * 100;


            addCell(
                row,
                learnerMap.get(result.learner_id) ||
                    "Learner unavailable"
            );

            addCell(row, result.academic_year);

            addCell(row, "Term " + result.term);

            addCell(row, result.subject);

            addCell(row, result.assessment_name);

            addCell(
                row,
                formatNumber(result.mark_obtained) +
                " / " +
                formatNumber(result.total_marks) +
                " (" +
                formatNumber(percentage) +
                "%)"
            );

            addCell(
                row,
                result.is_published
                    ? "Published"
                    : "Draft"
            );

            resultsTable.appendChild(row);

        });

    }


    // SAVE OR PUBLISH RESULT

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
                    "Please select Save as Draft or Publish Result.",
                    false
                );

                return;

            }


            submitting = true;

            const submitButtons =
                form.querySelectorAll(
                    'button[type="submit"]'
                );

            submitButtons.forEach(button => {
                button.disabled = true;
            });


            try {

                const admin =
                    await verifyAdmin();


                const learnerId =
                    learnerSelect.value;

                const academicYear =
                    Number(
                        document.getElementById(
                            "academicResultYear"
                        ).value
                    );

                const term =
                    Number(
                        document.getElementById(
                            "academicResultTerm"
                        ).value
                    );

                const subject =
                    document.getElementById(
                        "academicResultSubject"
                    ).value.trim();

                const assessmentName =
                    document.getElementById(
                        "academicAssessmentName"
                    ).value.trim();

                const mark =
                    Number(
                        document.getElementById(
                            "academicMarkObtained"
                        ).value
                    );

                const total =
                    Number(
                        document.getElementById(
                            "academicTotalMarks"
                        ).value
                    );

                const teacherComment =
                    document.getElementById(
                        "academicTeacherComment"
                    ).value.trim();


                // VALIDATION

                if (
                    !learnerId ||
                    !Number.isInteger(academicYear) ||
                    academicYear < 2000 ||
                    academicYear > 2100 ||
                    !Number.isInteger(term) ||
                    term < 1 ||
                    term > 4 ||
                    !subject ||
                    !assessmentName ||
                    !Number.isFinite(mark) ||
                    !Number.isFinite(total) ||
                    mark < 0 ||
                    total <= 0 ||
                    mark > total
                ) {

                    throw new Error(
                        "Please check all fields. The mark cannot exceed the total possible marks."
                    );

                }


                const publishing =
                    action === "publish";


                showMessage(
                    publishing
                        ? "Publishing academic result..."
                        : "Saving academic result as a draft...",
                    true
                );


                // SAVE TO SUPABASE

                const { error } =
                    await db
                        .from("academic_results")
                        .insert({

                            learner_id: learnerId,

                            academic_year: academicYear,

                            term: term,

                            subject: subject,

                            assessment_name:
                                assessmentName,

                            mark_obtained: mark,

                            total_marks: total,

                            teacher_comment:
                                teacherComment || null,

                            is_published: publishing,

                            published_at: publishing
                                ? new Date().toISOString()
                                : null,

                            created_by: admin.id

                        });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "This assessment already exists for this learner, term and subject."
                        );

                    }

                    throw error;

                }


                form.reset();


                // RESTORE DEFAULT YEAR

                document.getElementById(
                    "academicResultYear"
                ).value = new Date().getFullYear();


                await loadAcademicResults();


                showMessage(
                    publishing
                        ? "Academic result successfully published to the Parent Portal."
                        : "Academic result successfully saved as a draft.",
                    true
                );


            } catch (error) {

                console.error(
                    "Academic result operation failed:",
                    error
                );

                showMessage(
                    error.message ||
                        "Unable to save the academic result.",
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


    // INITIALISE ACADEMIC RESULTS

    async function initialise() {

        try {

            await verifyAdmin();

            await loadLearners();

            await loadAcademicResults();

        } catch (error) {

            console.error(
                "Academic results initialisation failed:",
                error
            );

            showMessage(
                error.message ||
                    "Unable to connect to academic results.",
                false
            );

        }

    }


    initialise();


})();
