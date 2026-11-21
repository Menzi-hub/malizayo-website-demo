
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE LEARNER MANAGEMENT
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const ADMIN_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

    const learnerForm =
        document.getElementById("learnerRegistrationForm");

    const linkForm =
        document.getElementById("parentLearnerLinkForm");

    const learnerMessage =
        document.getElementById("learnerRegistrationMessage");

    const linkMessage =
        document.getElementById("parentLearnerLinkMessage");

    const learnerTable =
        document.getElementById("adminLearnersTableBody");

    const linksTable =
        document.getElementById("adminParentLinksTableBody");

    const parentSelect =
        document.getElementById("linkParentSelect");

    const learnerSelect =
        document.getElementById("linkLearnerSelect");

    const registerButton =
        document.getElementById("registerLearnerButton");

    const linkButton =
        document.getElementById("linkLearnerButton");


    // STOP IF THE REQUIRED CONNECTION IS MISSING

    if (!db || !learnerForm || !linkForm) {

        console.error(
            "Learner management could not initialise."
        );

        return;

    }


    // DISPLAY MESSAGES

    function message(element, text, success) {

        element.textContent = text;

        element.style.color =
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
                "Only the authorised school administrator can manage learners."
            );

        }

        return data.user;

    }


    // SAFELY CREATE TABLE CELLS

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


    // LOAD LEARNER AND PARENT RECORDS

    async function loadRecords() {

        const results = await Promise.all([

            db.from("parent_profiles")
                .select("user_id, full_name, email")
                .order("full_name"),

            db.from("learners")
                .select(
                    "id, admission_number, full_name, grade, class_name, learner_status"
                )
                .order("full_name"),

            db.from("parent_learners")
                .select(
                    "parent_user_id, learner_id, relationship_to_learner"
                )

        ]);

        const parentResult = results[0];
        const learnerResult = results[1];
        const linkResult = results[2];

        if (parentResult.error) throw parentResult.error;
        if (learnerResult.error) throw learnerResult.error;
        if (linkResult.error) throw linkResult.error;

        const parents = parentResult.data || [];
        const learners = learnerResult.data || [];
        const links = linkResult.data || [];


        // PARENT DROPDOWN

        parentSelect.replaceChildren();

        addOption(
            parentSelect,
            "",
            "Select a parent or guardian"
        );

        parents.forEach(function (parent) {

            addOption(
                parentSelect,
                parent.user_id,
                parent.full_name + " — " + parent.email
            );

        });


        // LEARNER DROPDOWN

        learnerSelect.replaceChildren();

        addOption(
            learnerSelect,
            "",
            "Select a learner"
        );

        learners.forEach(function (learner) {

            addOption(
                learnerSelect,
                learner.id,
                learner.admission_number +
                    " — " +
                    learner.full_name +
                    " (" + learner.grade + ")"
            );

        });


        // LEARNER TABLE

        learnerTable.replaceChildren();

        if (learners.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 5;

            cell.textContent =
                "No learners registered yet.";

            row.appendChild(cell);
            learnerTable.appendChild(row);

        } else {

            learners.forEach(function (learner) {

                const row = document.createElement("tr");

                addCell(row, learner.admission_number);
                addCell(row, learner.full_name);
                addCell(row, learner.grade);
                addCell(row, learner.class_name);
                addCell(row, learner.learner_status);

                learnerTable.appendChild(row);

            });

        }


        // PARENT-LEARNER RELATIONSHIP TABLE

        linksTable.replaceChildren();

        const parentMap = new Map(
            parents.map(parent => [
                parent.user_id,
                parent
            ])
        );

        const learnerMap = new Map(
            learners.map(learner => [
                learner.id,
                learner
            ])
        );


        if (links.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 3;

            cell.textContent =
                "No parent-learner links created yet.";

            row.appendChild(cell);
            linksTable.appendChild(row);

        } else {

            links.forEach(function (link) {

                const row =
                    document.createElement("tr");

                const parent =
                    parentMap.get(link.parent_user_id);

                const learner =
                    learnerMap.get(link.learner_id);

                addCell(
                    row,
                    parent
                        ? parent.full_name
                        : "Parent unavailable"
                );

                addCell(
                    row,
                    learner
                        ? learner.full_name
                        : "Learner unavailable"
                );

                addCell(
                    row,
                    link.relationship_to_learner
                );

                linksTable.appendChild(row);

            });

        }

    }


    // =====================================
    // REGISTER LEARNER
    // =====================================

    learnerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            registerButton.disabled = true;

            registerButton.textContent =
                "Registering...";

            try {

                await verifyAdmin();

                const admissionNumber =
                    document.getElementById(
                        "learnerAdmissionNumber"
                    ).value.trim();

                const fullName =
                    document.getElementById(
                        "learnerFullName"
                    ).value.trim();

                const dateOfBirth =
                    document.getElementById(
                        "learnerDateOfBirth"
                    ).value;

                const grade =
                    document.getElementById(
                        "learnerGrade"
                    ).value;

                const className =
                    document.getElementById(
                        "learnerClass"
                    ).value.trim();


                if (
                    !admissionNumber ||
                    !fullName ||
                    !dateOfBirth ||
                    !grade
                ) {

                    throw new Error(
                        "Please complete all required fields."
                    );

                }


                const parsedDate =
                    new Date(dateOfBirth + "T00:00:00Z");

                if (
                    Number.isNaN(parsedDate.getTime()) ||
                    parsedDate.toISOString().slice(0, 10) !== dateOfBirth ||
                    dateOfBirth > new Date().toISOString().slice(0, 10)
                ) {

                    throw new Error(
                        "Please enter a valid date of birth."
                    );

                }


                const { error } =
                    await db.from("learners").insert({

                        admission_number: admissionNumber,
                        full_name: fullName,
                        date_of_birth: dateOfBirth,
                        grade: grade,
                        class_name: className || null,
                        learner_status: "Active"

                    });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "That admission number is already registered."
                        );

                    }

                    throw error;

                }


                learnerForm.reset();

                message(
                    learnerMessage,
                    "Learner registered successfully.",
                    true
                );

                await loadRecords();


            } catch (error) {

                console.error(
                    "Learner registration failed:",
                    error
                );

                message(
                    learnerMessage,
                    error.message,
                    false
                );

            } finally {

                registerButton.disabled = false;

                registerButton.textContent =
                    "Register Learner";

            }

        }
    );


    // =====================================
    // LINK PARENT TO LEARNER
    // =====================================

    linkForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            linkButton.disabled = true;

            linkButton.textContent =
                "Linking...";

            try {

                const admin = await verifyAdmin();

                const parentId = parentSelect.value;
                const learnerId = learnerSelect.value;

                const relationship =
                    document.getElementById(
                        "linkRelationship"
                    ).value;


                if (!parentId || !learnerId || !relationship) {

                    throw new Error(
                        "Please select a parent, learner and relationship."
                    );

                }


                const { error } =
                    await db.from("parent_learners").insert({

                        parent_user_id: parentId,
                        learner_id: learnerId,
                        relationship_to_learner: relationship,
                        linked_by: admin.id

                    });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "This parent is already linked to this learner."
                        );

                    }

                    throw error;

                }


                linkForm.reset();

                message(
                    linkMessage,
                    "Parent successfully linked to learner.",
                    true
                );

                await loadRecords();


            } catch (error) {

                console.error(
                    "Parent-learner linking failed:",
                    error
                );

                message(
                    linkMessage,
                    error.message,
                    false
                );

            } finally {

                linkButton.disabled = false;

                linkButton.textContent =
                    "Link Parent and Learner";

            }

        }
    );


    // =====================================
    // INITIALISE
    // =====================================

    async function initialise() {

        try {

            await verifyAdmin();

            await loadRecords();

            message(
                learnerMessage,
                "Learner management connected successfully.",
                true
            );

        } catch (error) {

            console.error(
                "Learner management initialisation failed:",
                error
            );

            message(
                learnerMessage,
                error.message ||
                    "Unable to load learner records.",
                false
            );

        }

    }


    initialise();


})();
