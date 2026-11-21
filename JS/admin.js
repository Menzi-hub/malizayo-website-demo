

/* =====================================
   MALIZAYO ADMIN DASHBOARD
   DEMONSTRATION JAVASCRIPT
===================================== */

(function () {

   
/* =====================================
   LIVE ADMISSIONS ELEMENTS
===================================== */

const admissionsTableBody =
    document.getElementById("admissionsTableBody");

const applicationsCount =
    document.getElementById("applicationsCount");

const documentsCount =
    document.getElementById("documentsCount");

const reviewedCount =
    document.getElementById("reviewedCount");

const adminNotice =
    document.getElementById("adminNotice");

const admissionDetailsPanel =
    document.getElementById("admissionDetailsPanel");

const admissionDetailsTitle =
    document.getElementById("admissionDetailsTitle");

const admissionDetailsContent =
    document.getElementById("admissionDetailsContent");

const admissionDocumentLinks =
    document.getElementById("admissionDocumentLinks");

const closeAdmissionDetails =
    document.getElementById("closeAdmissionDetails");


// ADMISSIONS SEARCH AND FILTER ELEMENTS

const admissionsSearch =
    document.getElementById("admissionsSearch");

const admissionsGradeFilter =
    document.getElementById("admissionsGradeFilter");

const admissionsStatusFilter =
    document.getElementById("admissionsStatusFilter");

const clearAdmissionsFilters =
    document.getElementById("clearAdmissionsFilters");

// CLOSE APPLICATION DETAILS

if (closeAdmissionDetails) {

    closeAdmissionDetails.addEventListener(
        "click",
        function () {

            admissionDetailsPanel.hidden = true;

        }
    );

}


    // REPORT FILE CHECK

    const reportFile =
        document.getElementById("reportFile");

    const checkReportButton =
        document.getElementById("checkReportButton");

    const reportMessage =
        document.getElementById("reportMessage");


    if (reportFile && checkReportButton && reportMessage) {

        checkReportButton.addEventListener(
            "click",
            function () {

                const file = reportFile.files[0];


                if (!file) {

                    reportMessage.textContent =
                        "Please choose a sample report first.";

                    return;

                }


                const extension =
                    file.name.split(".").pop().toLowerCase();

                const allowedExtensions = [
                    "pdf",
                    "jpg",
                    "jpeg",
                    "png"
                ];


                if (!allowedExtensions.includes(extension)) {

                    reportMessage.textContent =
                        "Invalid format. Choose PDF, JPG or PNG.";

                    reportFile.value = "";

                    return;

                }


                const maximumSize =
                    5 * 1024 * 1024;


                if (file.size > maximumSize) {

                    reportMessage.textContent =
                        "The file exceeds the 5 MB limit.";

                    reportFile.value = "";

                    return;

                }


                reportMessage.textContent =
                    "File checks passed: " +
                    file.name +
                    ". No upload or storage has taken place.";

            }
        );

    }


 



/* =====================================
   MANAGE SCHOOL ANNOUNCEMENTS
   SHARED SUPABASE DATABASE
===================================== */

const announcementForm =
    document.getElementById("announcementForm");

const announcementTitle =
    document.getElementById("announcementTitle");

const announcementCategory =
    document.getElementById("announcementCategory");

const announcementContent =
    document.getElementById("announcementContent");

const announcementMessage =
    document.getElementById("announcementMessage");

const adminAnnouncementList =
    document.getElementById("adminAnnouncementList");





const sharedSupabase = window.malizayoSupabase;
   
/* =====================================
   PARENT ACCOUNT REGISTRATION
   CONNECT TO INVITE-PARENT FUNCTION
===================================== */

const parentInvitationForm =
    document.getElementById("parentInvitationForm");

const parentFullName =
    document.getElementById("parentFullName");

const parentEmailAddress =
    document.getElementById("parentEmailAddress");

const parentPhoneNumber =
    document.getElementById("parentPhoneNumber");

const sendParentInvitationButton =
    document.getElementById("sendParentInvitationButton");

const parentInvitationMessage =
    document.getElementById("parentInvitationMessage");


if (
    parentInvitationForm &&
    sharedSupabase
) {

    parentInvitationForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const fullName =
                parentFullName.value.trim();

            const email =
                parentEmailAddress.value.trim().toLowerCase();

            const phone =
                parentPhoneNumber.value.trim();


            if (!fullName || !email) {

                parentInvitationMessage.textContent =
                    "Please enter the parent's name and email address.";

                return;

            }


            sendParentInvitationButton.disabled = true;

            sendParentInvitationButton.textContent =
                "Sending Invitation...";

            parentInvitationMessage.textContent =
                "Verifying administrator access...";


            try {

                // CHECK SIGNED-IN ADMINISTRATOR

                const { data: userData, error: userError } =
                    await sharedSupabase.auth.getUser();

                if (
                    userError ||
                    !userData.user ||
                    userData.user.id !==
                        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04"
                ) {

                    throw new Error(
                        "Only the authorised school administrator can register parents."
                    );

                }


                // CALL SECURE EDGE FUNCTION

                parentInvitationMessage.textContent =
                    "Sending parent invitation...";

                const { data, error } =
                    await sharedSupabase.functions.invoke(
                        "invite-parent",
                        {
                            body: {
                                full_name: fullName,
                                email: email,
                                phone: phone
                            }
                        }
                    );


                // HANDLE SERVER ERRORS

                if (error) {

                    let responseBody = null;

                    if (
                        error.context &&
                        typeof error.context.json === "function"
                    ) {

                        try {

                            responseBody =
                                await error.context.json();

                        } catch {
                            responseBody = null;
                        }

                    }


                    // Invitation may exist even if profile
                    // creation failed. Never resend automatically.

                    if (
                        responseBody &&
                        responseBody.invitationCreated === true
                    ) {

                        throw new Error(
                            "The invitation was created, but the parent profile could not be saved. Do not resend the invitation. Please contact the administrator for assistance."
                        );

                    }

                    throw new Error(
                        responseBody?.message ||
                        error.message ||
                        "Unable to send the parent invitation."
                    );

                }


                if (!data || data.success !== true) {

                    throw new Error(
                        data?.message ||
                        "The parent invitation could not be completed."
                    );

                }


                // SUCCESS

                parentInvitationForm.reset();

                parentInvitationMessage.style.color =
                    "#216638";

                parentInvitationMessage.textContent =
                    "Invitation sent successfully to " +
                    data.parent.email +
                    ". The parent can now check their email and create a password.";

            } catch (error) {

                console.error(
                    "Parent registration failed:",
                    error
                );

                parentInvitationMessage.style.color =
                    "#922E26";

                parentInvitationMessage.textContent =
                    error.message ||
                    "Parent registration failed. Please try again.";

            } finally {

                sendParentInvitationButton.disabled = false;

                sendParentInvitationButton.textContent =
                    "Send Parent Invitation";

            }

        }
    );

}



/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE ANNOUNCEMENT MANAGEMENT
   SUPABASE DATABASE
========================================= */

const ANNOUNCEMENT_ADMIN_ID =
    "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

const announcementPublicationStatus =
    document.getElementById(
        "announcementPublicationStatus"
    );

let editingAnnouncementId = null;
let editingAnnouncementPublishedAt = null;
let editingAnnouncementWasPublished = false;

let announcementSaving = false;

const announcementSubmitButton =
    announcementForm
        ? announcementForm.querySelector(
            'button[type="submit"]'
        )
        : null;


// =====================================
// DISPLAY ANNOUNCEMENT MESSAGES
// =====================================

function setAnnouncementMessage(text, success) {

    if (!announcementMessage) return;

    announcementMessage.textContent = text;

    announcementMessage.style.color =
        success === true
            ? "#216638"
            : success === false
                ? "#922E26"
                : "";

}


// =====================================
// VERIFY AUTHORISED ADMINISTRATOR
// =====================================

async function verifyAnnouncementAdmin() {

    if (!sharedSupabase) {

        throw new Error(
            "Supabase database connection is unavailable."
        );

    }

    const {
        data,
        error
    } = await sharedSupabase.auth.getUser();


    if (
        error ||
        !data.user ||
        data.user.id !== ANNOUNCEMENT_ADMIN_ID
    ) {

        throw new Error(
            "Only the authorised school administrator can manage announcements."
        );

    }

    return data.user;

}


// =====================================
// RESET ANNOUNCEMENT EDITOR
// =====================================

function resetAnnouncementEditor() {

    if (announcementForm) {
        announcementForm.reset();
    }

    editingAnnouncementId = null;

    editingAnnouncementPublishedAt = null;

    editingAnnouncementWasPublished = false;


    if (announcementPublicationStatus) {

        announcementPublicationStatus.value =
            "draft";

    }


    if (announcementSubmitButton) {

        announcementSubmitButton.textContent =
            "Save Announcement";

        announcementSubmitButton.disabled =
            false;

    }

}


// =====================================
// FORMAT ANNOUNCEMENT DATE
// =====================================

function formatAnnouncementDate(dateValue) {

    if (!dateValue) {
        return "Date unavailable";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
        return "Date unavailable";
    }

    return date.toLocaleString("en-ZA", {
        dateStyle: "medium",
        timeStyle: "short"
    });

}


// =====================================
// DISPLAY ANNOUNCEMENTS
// ADMIN CAN SEE DRAFTS AND PUBLISHED
// =====================================

function displayAdminAnnouncements(announcements) {

    if (!adminAnnouncementList) return;

    adminAnnouncementList.replaceChildren();


    if (
        !announcements ||
        announcements.length === 0
    ) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No announcements have been created yet.";

        adminAnnouncementList.appendChild(
            emptyMessage
        );

        return;

    }


    announcements.forEach(function (announcement) {

        // CREATE ANNOUNCEMENT CARD

        const card =
            document.createElement("article");

        card.className =
            "announcement-admin-card";


        // TITLE

        const heading =
            document.createElement("h4");

        heading.textContent =
            announcement.title;


        // CATEGORY

        const category =
            document.createElement("p");

        category.textContent =
            "Category: " + announcement.category;


        // PUBLICATION STATUS

        const status =
            document.createElement("p");

        status.textContent =
            announcement.is_published
                ? "Status: PUBLISHED"
                : "Status: DRAFT — NOT VISIBLE TO PARENTS";


        // DATE

        const date =
            document.createElement("p");

        const dateValue =
            announcement.is_published
                ? announcement.published_at
                : announcement.created_at;

        date.textContent =
            (
                announcement.is_published
                    ? "Published: "
                    : "Created: "
            ) + formatAnnouncementDate(dateValue);


        // CONTENT

        const content =
            document.createElement("p");

        content.textContent =
            announcement.content;


        // =====================================
        // EDIT BUTTON
        // =====================================

        const editButton =
            document.createElement("button");

        editButton.type = "button";

        editButton.textContent =
            "Edit Announcement";

        editButton.addEventListener(
            "click",
            function () {

                editingAnnouncementId =
                    announcement.id;

                editingAnnouncementPublishedAt =
                    announcement.published_at || null;

                editingAnnouncementWasPublished =
                    announcement.is_published === true;


                announcementTitle.value =
                    announcement.title;

                announcementCategory.value =
                    announcement.category;

                announcementContent.value =
                    announcement.content;


                announcementPublicationStatus.value =
                    announcement.is_published
                        ? "publish"
                        : "draft";


                announcementSubmitButton.textContent =
                    "Update Announcement";


                setAnnouncementMessage(
                    "Announcement loaded for editing.",
                    true
                );

                announcementTitle.focus();

                announcementForm.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });

            }
        );


        // =====================================
        // DELETE BUTTON
        // =====================================

        const removeButton =
            document.createElement("button");

        removeButton.type = "button";

        removeButton.textContent =
            "Remove Announcement";


        removeButton.addEventListener(
            "click",
            async function () {

                const confirmed = window.confirm(
                    "Are you sure you want to permanently delete this announcement?"
                );

                if (!confirmed) return;


                removeButton.disabled = true;

                removeButton.textContent =
                    "Deleting...";


                try {

                    await verifyAnnouncementAdmin();


                    const {
                        data,
                        error
                    } = await sharedSupabase
                        .from("announcements")
                        .delete()
                        .eq("id", announcement.id)
                        .select("id");


                    if (error) throw error;


                    if (!data || data.length === 0) {

                        throw new Error(
                            "Announcement was not deleted. Check administrator permissions."
                        );

                    }


                    if (
                        editingAnnouncementId ===
                        announcement.id
                    ) {

                        resetAnnouncementEditor();

                    }


                    setAnnouncementMessage(
                        "Announcement deleted successfully.",
                        true
                    );

                    await loadAdminAnnouncements();


                } catch (error) {

                    console.error(
                        "Announcement deletion failed:",
                        error
                    );

                    setAnnouncementMessage(
                        error.message ||
                            "Unable to delete announcement.",
                        false
                    );

                    removeButton.disabled = false;

                    removeButton.textContent =
                        "Remove Announcement";

                }

            }
        );


        // ADD ELEMENTS TO CARD

        card.appendChild(heading);

        card.appendChild(category);

        card.appendChild(status);

        card.appendChild(date);

        card.appendChild(content);

        card.appendChild(editButton);

        card.appendChild(removeButton);


        adminAnnouncementList.appendChild(card);

    });

}


// =====================================
// LOAD ALL ANNOUNCEMENTS FROM SUPABASE
// INCLUDING UNPUBLISHED DRAFTS
// =====================================

async function loadAdminAnnouncements() {

    if (
        !adminAnnouncementList ||
        !sharedSupabase
    ) {
        return;
    }

    try {

        await verifyAnnouncementAdmin();


        const {
            data,
            error
        } = await sharedSupabase
            .from("announcements")
            .select(`
                id,
                title,
                category,
                content,
                published_at,
                is_published,
                created_at,
                updated_at
            `)
            .order("created_at", {
                ascending: false
            });


        if (error) throw error;


        displayAdminAnnouncements(data);


    } catch (error) {

        console.error(
            "Unable to load announcements:",
            error
        );

        adminAnnouncementList.textContent =
            "Unable to load announcements. Please sign in as the authorised administrator.";

        setAnnouncementMessage(
            error.message ||
                "Unable to retrieve announcements.",
            false
        );

    }

}


// =====================================
// SAVE, PUBLISH OR UPDATE ANNOUNCEMENT
// =====================================

if (
    announcementForm &&
    announcementPublicationStatus &&
    announcementSubmitButton
) {

    announcementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            if (announcementSaving) return;


            // READ FORM INFORMATION

            const title =
                announcementTitle.value.trim();

            const category =
                announcementCategory.value;

            const content =
                announcementContent.value.trim();

            const publicationChoice =
                announcementPublicationStatus.value;


            // VALIDATE FORM

            if (
                !title ||
                !category ||
                !content
            ) {

                setAnnouncementMessage(
                    "Please complete all announcement fields.",
                    false
                );

                return;

            }


            if (
                title.length > 100 ||
                content.length > 1000
            ) {

                setAnnouncementMessage(
                    "The title or announcement message exceeds the allowed length.",
                    false
                );

                return;

            }


            const allowedCategories = [
                "SCHOOL NOTICE",
                "PARENT NOTICE",
                "ACADEMIC NOTICE",
                "SPORTS NOTICE",
                "EVENT NOTICE"
            ];


            if (!allowedCategories.includes(category)) {

                setAnnouncementMessage(
                    "Please select a valid announcement category.",
                    false
                );

                return;

            }


            if (
                publicationChoice !== "draft" &&
                publicationChoice !== "publish"
            ) {

                setAnnouncementMessage(
                    "Please select a valid publication status.",
                    false
                );

                return;

            }


            const shouldPublish =
                publicationChoice === "publish";

            const wasEditing =
                Boolean(editingAnnouncementId);


            announcementSaving = true;

            announcementSubmitButton.disabled =
                true;

            announcementSubmitButton.textContent =
                wasEditing
                    ? "Updating..."
                    : shouldPublish
                        ? "Publishing..."
                        : "Saving Draft...";


            try {

                // VERIFY ADMINISTRATOR

                await verifyAnnouncementAdmin();


                const now =
                    new Date().toISOString();


                // =====================================
                // UPDATE EXISTING ANNOUNCEMENT
                // =====================================

                if (wasEditing) {

                    // Preserve the original publication date
                    // when an already-published announcement
                    // remains published.

                    const publishedAt =
                        shouldPublish
                            ? (
                                editingAnnouncementWasPublished &&
                                editingAnnouncementPublishedAt
                                    ? editingAnnouncementPublishedAt
                                    : now
                            )
                            : null;


                    const {
                        data,
                        error
                    } = await sharedSupabase
                        .from("announcements")
                        .update({

                            title: title,

                            category: category,

                            content: content,

                            is_published: shouldPublish,

                            published_at: publishedAt,

                            updated_at: now

                        })
                        .eq("id", editingAnnouncementId)
                        .select("id");


                    if (error) throw error;


                    if (!data || data.length === 0) {

                        throw new Error(
                            "Announcement could not be updated. Check administrator permissions."
                        );

                    }

                }


                // =====================================
                // CREATE NEW ANNOUNCEMENT
                // =====================================

                else {

                    const {
                        error
                    } = await sharedSupabase
                        .from("announcements")
                        .insert({

                            title: title,

                            category: category,

                            content: content,

                            is_published: shouldPublish,

                            published_at: shouldPublish
                                ? now
                                : null

                        });


                    if (error) throw error;

                }


                // =====================================
                // RESET FORM AFTER SUCCESS
                // =====================================

                resetAnnouncementEditor();


                // SUCCESS MESSAGE

                if (shouldPublish) {

                    setAnnouncementMessage(
                        wasEditing
                            ? "Announcement updated and published successfully."
                            : "Announcement published successfully.",
                        true
                    );

                } else {

                    setAnnouncementMessage(
                        wasEditing
                            ? "Announcement updated and saved as a draft."
                            : "Announcement saved as a draft. It is not visible to parents.",
                        true
                    );

                }


                // REFRESH ANNOUNCEMENT REGISTER

                await loadAdminAnnouncements();


            } catch (error) {

                console.error(
                    "Announcement saving failed:",
                    error
                );

                setAnnouncementMessage(
                    error.message ||
                        "Unable to save announcement.",
                    false
                );

            } finally {

                announcementSaving = false;

                announcementSubmitButton.disabled =
                    false;

                announcementSubmitButton.textContent =
                    editingAnnouncementId
                        ? "Update Announcement"
                        : "Save Announcement";

            }

        }
    );

}
else {

    console.error(
        "Announcement management form or publication status field is missing."
    );

}

/* =====================================
   LIVE ADMISSIONS MANAGEMENT
   MALIZAYO PRIMARY SCHOOL
===================================== */

const admissionsBucket = "admissions-documents";

const admissionDocuments = [
    {
        label: "Birth Certificate",
        field: "birth_certificate_path"
    },
    {
        label: "Parent ID",
        field: "parent_id_path"
    },
    {
        label: "Proof of Residence",
        field: "proof_residence_path"
    },
    {
        label: "Previous School Report",
        field: "previous_report_path"
    },
    {
        label: "Signature",
        field: "signature_path"
    }
];

const admissionStatusClasses = {
    "Pending Review": "status-pending",
    "Under Review": "status-review",
    "Approved": "status-approved",
    "Awaiting Documents": "status-documents"
};


// CREATE A TABLE CELL SAFELY

function addAdmissionCell(row, value) {

    const cell = document.createElement("td");

    cell.textContent =
        value === null || value === undefined || value === ""
            ? "Not provided"
            : String(value);

    row.appendChild(cell);

    return cell;

}


// APPLY ADMISSIONS SEARCH AND FILTERS

function applyAdmissionsFilters() {

    if (!admissionsTableBody) return;

    const searchTerm = admissionsSearch
        ? admissionsSearch.value.trim().toLowerCase()
        : "";

    const selectedGrade = admissionsGradeFilter
        ? admissionsGradeFilter.value.trim().toLowerCase()
        : "";

    const selectedStatus = admissionsStatusFilter
        ? admissionsStatusFilter.value.trim().toLowerCase()
        : "";

    const rows =
        Array.from(admissionsTableBody.querySelectorAll("tr"));

    let applicationRows = 0;
    let visibleRows = 0;

    rows.forEach(function (row) {

        // Ignore loading, error and empty-state rows.

        if (!row.cells || row.cells.length < 6) {
            return;
        }

        applicationRows++;

        const reference =
            row.cells[0].textContent.trim().toLowerCase();

        const learner =
            row.cells[1].textContent.trim().toLowerCase();

        const grade =
            row.cells[2].textContent
                .trim()
                .replace(/^grade\s*/i, "")
                .toLowerCase();

        const status =
            row.cells[4].textContent.trim().toLowerCase();

        const matchesSearch =
            !searchTerm ||
            reference.includes(searchTerm) ||
            learner.includes(searchTerm);

        const matchesGrade =
            !selectedGrade ||
            grade === selectedGrade;

        const matchesStatus =
            !selectedStatus ||
            status === selectedStatus;

        const isVisible =
            matchesSearch &&
            matchesGrade &&
            matchesStatus;

        row.hidden = !isVisible;

        if (isVisible) {
            visibleRows++;
        }

    });


    // REMOVE PREVIOUS NO-RESULTS MESSAGE

    const previousMessage =
        document.getElementById("admissionsFilterNoResults");

    if (previousMessage) {
        previousMessage.remove();
    }


    // SHOW MESSAGE WHEN NO APPLICATIONS MATCH

    if (applicationRows > 0 && visibleRows === 0) {

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        row.id = "admissionsFilterNoResults";

        cell.colSpan = 6;

        cell.textContent =
            "No applications match your search or filters.";

        row.appendChild(cell);

        admissionsTableBody.appendChild(row);

    }

}


// CONNECT FILTER CONTROLS

if (admissionsSearch) {

    admissionsSearch.addEventListener(
        "input",
        applyAdmissionsFilters
    );

}

if (admissionsGradeFilter) {

    admissionsGradeFilter.addEventListener(
        "change",
        applyAdmissionsFilters
    );

}

if (admissionsStatusFilter) {

    admissionsStatusFilter.addEventListener(
        "change",
        applyAdmissionsFilters
    );

}


// CLEAR ALL FILTERS

if (clearAdmissionsFilters) {

    clearAdmissionsFilters.addEventListener(
        "click",
        function () {

            if (admissionsSearch) {
                admissionsSearch.value = "";
            }

            if (admissionsGradeFilter) {
                admissionsGradeFilter.value = "";
            }

            if (admissionsStatusFilter) {
                admissionsStatusFilter.value = "";
            }

            applyAdmissionsFilters();

        }
    );

}

// LOAD APPLICATIONS FROM SUPABASE

async function loadAdminApplications() {

    if (!admissionsTableBody || !sharedSupabase) {
        return;
    }

    admissionsTableBody.replaceChildren();

    const loadingRow = document.createElement("tr");
    const loadingCell = document.createElement("td");

    loadingCell.colSpan = 6;
    loadingCell.textContent =
        "Loading applications...";

    loadingRow.appendChild(loadingCell);
    admissionsTableBody.appendChild(loadingRow);

    try {

        const { data, error } =
            await sharedSupabase
                .from("admissions")
                .select(
                    "id, learner_name, date_of_birth, grade_applying_for, previous_school, parent_guardian_name, relationship_to_learner, parent_phone, parent_email, residential_address, signature_name, declaration_accepted, birth_certificate_path, parent_id_path, proof_residence_path, previous_report_path, signature_path, status, submitted_at"
                )
                .order("submitted_at", {
                    ascending: false
                });

        if (error) {
            throw error;
        }

        const applications = data || [];

        admissionsTableBody.replaceChildren();

        // UPDATE DASHBOARD COUNTS

        if (applicationsCount) {
            applicationsCount.textContent =
                applications.length;
        }

        if (documentsCount) {

            documentsCount.textContent =
                applications.filter(function (application) {

                    return admissionDocuments
                        .filter(function (documentInfo) {
                            return documentInfo.field !== "signature_path";
                        })
                        .some(function (documentInfo) {
                            return !application[documentInfo.field];
                        });

                }).length;

        }

        if (reviewedCount) {

            reviewedCount.textContent =
                applications.filter(function (application) {
                    return application.status === "Approved";
                }).length;

        }


        // SHOW EMPTY STATE

        if (applications.length === 0) {

            const row = document.createElement("tr");
            const cell = document.createElement("td");

            cell.colSpan = 6;

            cell.textContent =
                "No admission applications have been submitted yet.";

            row.appendChild(cell);
            admissionsTableBody.appendChild(row);

            return;

        }


        // DISPLAY APPLICATION ROWS

        applications.forEach(function (application) {

            const row = document.createElement("tr");

            const reference =
                "MPS-" +
                application.id.slice(0, 8).toUpperCase();

            addAdmissionCell(row, reference);

            addAdmissionCell(
                row,
                application.learner_name
            );

            addAdmissionCell(
                row,
                application.grade_applying_for
            );


            // DOCUMENT COUNT

            const uploadedDocuments =
                admissionDocuments
                    .filter(function (documentInfo) {
                        return documentInfo.field !== "signature_path";
                    })
                    .filter(function (documentInfo) {
                        return Boolean(application[documentInfo.field]);
                    }).length;

            addAdmissionCell(
                row,
                uploadedDocuments + "/4 uploaded"
            );


            // APPLICATION STATUS

            const statusCell =
                document.createElement("td");

            const statusBadge =
                document.createElement("span");

            statusBadge.className =
                "status-pill " +
                (
                    admissionStatusClasses[application.status] ||
                    "status-pending"
                );

            statusBadge.textContent =
                application.status;

            statusCell.appendChild(statusBadge);
            row.appendChild(statusCell);


            // ACTIONS

            const actionsCell =
                document.createElement("td");

            actionsCell.className = "admin-actions";


            const viewButton =
                document.createElement("button");

            viewButton.type = "button";
            viewButton.textContent = "View";

            viewButton.addEventListener(
                "click",
                function () {
                    viewAdminApplication(application);
                }
            );


            const statusSelect =
                document.createElement("select");

            statusSelect.className = "status-choice";
            statusSelect.setAttribute(
                "aria-label",
                "Application status"
            );

            [
                "Pending Review",
                "Under Review",
                "Approved",
                "Awaiting Documents"
            ].forEach(function (status) {

                const option =
                    document.createElement("option");

                option.value = status;
                option.textContent = status;

                if (status === application.status) {
                    option.selected = true;
                }

                statusSelect.appendChild(option);

            });


            const updateButton =
                document.createElement("button");

            updateButton.type = "button";
            updateButton.textContent = "Update";

            updateButton.addEventListener(
                "click",
                async function () {

                    await updateAdminApplicationStatus(
                        application.id,
                        statusSelect.value,
                        updateButton
                    );

                }
            );


            actionsCell.appendChild(viewButton);
            actionsCell.appendChild(statusSelect);
            actionsCell.appendChild(updateButton);

            row.appendChild(actionsCell);

                    admissionsTableBody.appendChild(row);

        });

        // APPLY SEARCH AND FILTERS AFTER LOADING

        applyAdmissionsFilters();

    } catch (error) {

        console.error(
            "Admissions loading failed:",
            error
        );

        admissionsTableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");

        cell.colSpan = 6;

        cell.textContent =
            "Unable to load applications. Please check administrator access.";

        row.appendChild(cell);
        admissionsTableBody.appendChild(row);

        if (adminNotice) {
            adminNotice.textContent = error.message;
        }

    }

}


// VIEW APPLICATION DETAILS AND PRIVATE DOCUMENTS

async function viewAdminApplication(application) {

    if (!admissionDetailsPanel) {
        return;
    }

    admissionDetailsPanel.hidden = false;

    admissionDetailsTitle.textContent =
        "Application MPS-" +
        application.id.slice(0, 8).toUpperCase();

    admissionDetailsContent.replaceChildren();

    admissionDocumentLinks.replaceChildren();


    const details = [
        ["Learner", application.learner_name],
        ["Date of Birth", application.date_of_birth],
        ["Grade", application.grade_applying_for],
        ["Previous School", application.previous_school],
        ["Parent / Guardian", application.parent_guardian_name],
        ["Relationship", application.relationship_to_learner],
        ["Contact Number", application.parent_phone],
        ["Email Address", application.parent_email],
        ["Residential Address", application.residential_address],
        ["Signature Name", application.signature_name],
        ["Application Status", application.status],
        [
            "Date Submitted",
            new Date(application.submitted_at).toLocaleString("en-ZA")
        ]
    ];


    details.forEach(function (detail) {

        const paragraph = document.createElement("p");

        const label = document.createElement("strong");

        label.textContent = detail[0] + ": ";

        const value = document.createTextNode(
            detail[1] || "Not provided"
        );

        paragraph.appendChild(label);
        paragraph.appendChild(value);

        admissionDetailsContent.appendChild(paragraph);

    });


    // GENERATE SHORT-LIVED PRIVATE DOCUMENT LINKS

    for (const documentInfo of admissionDocuments) {

        const paragraph = document.createElement("p");

        const label = document.createElement("strong");

        label.textContent = documentInfo.label + ": ";

        paragraph.appendChild(label);

        const path =
            application[documentInfo.field];

        if (!path) {

            paragraph.appendChild(
                document.createTextNode("Not uploaded")
            );

        } else {

            try {

                const { data, error } =
                    await sharedSupabase.storage
                        .from(admissionsBucket)
                        .createSignedUrl(path, 300);

                if (error) {
                    throw error;
                }

                const link =
                    document.createElement("a");

                link.href = data.signedUrl;

                link.target = "_blank";

                link.rel = "noopener noreferrer";

                link.textContent =
                    "View " + documentInfo.label;

                paragraph.appendChild(link);

            } catch (error) {

                console.error(
                    "Private document access failed:",
                    error
                );

                paragraph.appendChild(
                    document.createTextNode(
                        "Unable to open document"
                    )
                );

            }

        }

        admissionDocumentLinks.appendChild(paragraph);

    }

    admissionDetailsPanel.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


// UPDATE APPLICATION STATUS

async function updateAdminApplicationStatus(
    applicationId,
    newStatus,
    button
) {

    button.disabled = true;
    button.textContent = "Updating...";

    try {

        const { data: userData, error: userError } =
            await sharedSupabase.auth.getUser();

        if (userError || !userData.user) {
            throw new Error(
                "Please sign in again as administrator."
            );
        }

        const { data, error } =
            await sharedSupabase
                .from("admissions")
                .update({
                    status: newStatus,
                    updated_at: new Date().toISOString(),
                    reviewed_by:
                        newStatus === "Pending Review"
                            ? null
                            : userData.user.id,
                    reviewed_at:
                        newStatus === "Pending Review"
                            ? null
                            : new Date().toISOString()
                })
                .eq("id", applicationId)
                .select("id");

        if (error) {
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error(
                "The application status was not updated."
            );
        }

        if (adminNotice) {
            adminNotice.textContent =
                "Application status updated successfully.";
        }

        await loadAdminApplications();

    } catch (error) {

        console.error(
            "Application status update failed:",
            error
        );

        if (adminNotice) {
            adminNotice.textContent = error.message;
        }

    } finally {

        button.disabled = false;
        button.textContent = "Update";

    }

}


// LOAD ANNOUNCEMENTS WHEN ADMIN SESSION IS AVAILABLE

if (sharedSupabase) {

    sharedSupabase.auth.onAuthStateChange(
        function (event, session) {

            // Load announcements and admissions
            // on first session and after sign-in

            if (
                (
                    event === "INITIAL_SESSION" ||
                    event === "SIGNED_IN"
                ) && session
            ) {

                window.setTimeout(function () {

                    loadAdminAnnouncements();
                    loadAdminApplications();

                }, 0);

            }


            // Clear sensitive information after sign-out

            if (event === "SIGNED_OUT") {

                if (adminAnnouncementList) {
                    adminAnnouncementList.replaceChildren();
                }

                if (announcementMessage) {
                    announcementMessage.textContent =
                        "Please sign in to manage announcements.";
                }

                if (admissionsTableBody) {
                    admissionsTableBody.replaceChildren();
                }

                if (admissionDetailsPanel) {
                    admissionDetailsPanel.hidden = true;
                }

                if (admissionDetailsContent) {
                    admissionDetailsContent.replaceChildren();
                }

                if (admissionDocumentLinks) {
                    admissionDocumentLinks.replaceChildren();
                }

                if (applicationsCount) {
                    applicationsCount.textContent = "0";
                }

                if (documentsCount) {
                    documentsCount.textContent = "0";
                }

                if (reviewedCount) {
                    reviewedCount.textContent = "0";
                }

            }

        }
    );

}

})();

/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE LEARNER MANAGEMENT
   PARENT-LEARNER LINKING
========================================= */

(function initializeLearnerManagement() {

    const MPS_ADMIN_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";

    const learnerForm =
        document.getElementById("learnerRegistrationForm");

    const parentLinkForm =
        document.getElementById("parentLearnerLinkForm");

    const learnerMessage =
        document.getElementById("learnerRegistrationMessage");

    const linkMessage =
        document.getElementById("parentLearnerLinkMessage");

    const learnersTable =
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


    // CHECK PAGE AND SUPABASE CONNECTION

    if (
        !learnerForm ||
        !parentLinkForm ||
        !sharedSupabase
    ) {
        return;
    }


    // DISPLAY MESSAGES SAFELY

    function setMessage(element, message, success) {

        if (!element) return;

        element.textContent = message;

        element.style.color = success
            ? "#216638"
            : "#922E26";

    }


    // VERIFY AUTHORISED ADMINISTRATOR

    async function requireSchoolAdmin() {

        const {
            data,
            error
        } = await sharedSupabase.auth.getUser();

        if (
            error ||
            !data.user ||
            data.user.id !== MPS_ADMIN_ID
        ) {

            throw new Error(
                "Only the authorised school administrator can manage learner records."
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


    // CREATE SELECT OPTIONS

    function addOption(select, value, label) {

        const option =
            document.createElement("option");

        option.value = value;

        option.textContent = label;

        select.appendChild(option);

    }


    // DISPLAY REGISTERED LEARNERS

    function renderLearners(learners) {

        learnersTable.replaceChildren();

        if (learners.length === 0) {

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 5;

            cell.textContent =
                "No learner records have been registered yet.";

            row.appendChild(cell);

            learnersTable.appendChild(row);

            return;

        }


        learners.forEach(function (learner) {

            const row =
                document.createElement("tr");

            addCell(row, learner.admission_number);
            addCell(row, learner.full_name);
            addCell(row, learner.grade);
            addCell(row, learner.class_name || "-");
            addCell(row, learner.learner_status);

            learnersTable.appendChild(row);

        });

    }


    // DISPLAY PARENT-LEARNER LINKS

    function renderParentLinks(
        links,
        parents,
        learners
    ) {

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

            const row =
                document.createElement("tr");

            const cell =
                document.createElement("td");

            cell.colSpan = 3;

            cell.textContent =
                "No parent-learner relationships have been created yet.";

            row.appendChild(cell);

            linksTable.appendChild(row);

            return;

        }


        links.forEach(function (link) {

            const parent =
                parentMap.get(link.parent_user_id);

            const learner =
                learnerMap.get(link.learner_id);

            const row =
                document.createElement("tr");

            addCell(
                row,
                parent
                    ? parent.full_name + " (" + parent.email + ")"
                    : "Parent profile unavailable"
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


    // LOAD PARENTS AND LEARNERS

    async function loadLearnerManagement() {

        const [
            parentsResult,
            learnersResult,
            linksResult
        ] = await Promise.all([

            sharedSupabase
                .from("parent_profiles")
                .select("user_id, full_name, email")
                .order("full_name"),

            sharedSupabase
                .from("learners")
                .select(
                    "id, admission_number, full_name, grade, class_name, learner_status"
                )
                .order("full_name"),

            sharedSupabase
                .from("parent_learners")
                .select(
                    "parent_user_id, learner_id, relationship_to_learner"
                )

        ]);


        if (parentsResult.error) {
            throw parentsResult.error;
        }

        if (learnersResult.error) {
            throw learnersResult.error;
        }

        if (linksResult.error) {
            throw linksResult.error;
        }


        const parents =
            parentsResult.data || [];

        const learners =
            learnersResult.data || [];

        const links =
            linksResult.data || [];


        // POPULATE PARENT SELECT

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


        // POPULATE LEARNER SELECT

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
                    " (" +
                    learner.grade +
                    ")"
            );

        });


        // DISPLAY TABLES

        renderLearners(learners);

        renderParentLinks(
            links,
            parents,
            learners
        );

    }


    // =====================================
    // REGISTER A LEARNER
    // =====================================

    learnerForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            registerButton.disabled = true;

            registerButton.textContent =
                "Registering...";


            try {

                await requireSchoolAdmin();

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
                        "Please complete all required learner information."
                    );

                }


                const today =
                    new Date().toISOString().slice(0, 10);

                if (dateOfBirth > today) {

                    throw new Error(
                        "The learner's date of birth cannot be in the future."
                    );

                }


                setMessage(
                    learnerMessage,
                    "Saving learner record...",
                    true
                );


                const {
                    error
                } = await sharedSupabase
                    .from("learners")
                    .insert({

                        admission_number:
                            admissionNumber,

                        full_name:
                            fullName,

                        date_of_birth:
                            dateOfBirth,

                        grade:
                            grade,

                        class_name:
                            className || null,

                        learner_status:
                            "Active"

                    });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "This admission number is already registered."
                        );

                    }

                    throw error;

                }


                learnerForm.reset();

                setMessage(
                    learnerMessage,
                    "Learner registered successfully.",
                    true
                );

                await loadLearnerManagement();


            } catch (error) {

                console.error(
                    "Learner registration failed:",
                    error
                );

                setMessage(
                    learnerMessage,
                    error.message ||
                        "Unable to register learner.",
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

    parentLinkForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            linkButton.disabled = true;

            linkButton.textContent =
                "Creating relationship...";


            try {

                const admin =
                    await requireSchoolAdmin();

                const parentUserId =
                    parentSelect.value;

                const learnerId =
                    learnerSelect.value;

                const relationship =
                    document.getElementById(
                        "linkRelationship"
                    ).value;


                if (
                    !parentUserId ||
                    !learnerId ||
                    !relationship
                ) {

                    throw new Error(
                        "Please select a parent, learner and relationship."
                    );

                }


                setMessage(
                    linkMessage,
                    "Verifying parent and learner records...",
                    true
                );


                // INSERT THE AUTHORISED RELATIONSHIP

                const {
                    error
                } = await sharedSupabase
                    .from("parent_learners")
                    .insert({

                        parent_user_id:
                            parentUserId,

                        learner_id:
                            learnerId,

                        relationship_to_learner:
                            relationship,

                        linked_by:
                            admin.id

                    });


                if (error) {

                    if (error.code === "23505") {

                        throw new Error(
                            "This parent is already linked to this learner."
                        );

                    }

                    throw error;

                }


                parentLinkForm.reset();

                setMessage(
                    linkMessage,
                    "Parent successfully linked to learner.",
                    true
                );

                await loadLearnerManagement();


            } catch (error) {

                console.error(
                    "Parent-learner linking failed:",
                    error
                );

                setMessage(
                    linkMessage,
                    error.message ||
                        "Unable to link parent to learner.",
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
    // INITIALISE MANAGEMENT PAGE
    // =====================================

    async function initialise() {

        try {

            await requireSchoolAdmin();

            await loadLearnerManagement();

            setMessage(
                learnerMessage,
                "Learner management connected to Supabase.",
                true
            );

        } catch (error) {

            console.error(
                "Learner management initialisation failed:",
                error
            );

            setMessage(
                learnerMessage,
                error.message ||
                    "Unable to load learner management.",
                false
            );

        }

    }


    initialise();

})();



