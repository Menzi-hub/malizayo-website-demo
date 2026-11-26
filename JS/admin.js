

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
    "id, learner_name, date_of_birth, grade_applying_for, previous_school, parent_guardian_name, relationship_to_learner, parent_phone, parent_email, residential_address, signature_name, declaration_accepted, birth_certificate_path, parent_id_path, proof_residence_path, previous_report_path, signature_path, status, submitted_at, registered_learner_id, registered_at"
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


           // DOWNLOAD COMPLETED ADMISSION FORM

const downloadPdfButton =
    document.createElement("button");

downloadPdfButton.type = "button";

downloadPdfButton.textContent = "Download PDF";

downloadPdfButton.addEventListener(
    "click",
    function () {
        downloadAdmissionApplicationPdf(
            application,
            downloadPdfButton
        );
    }
);


// ADD ACTIONS TO TABLE

// ADD EXISTING ACTIONS

actionsCell.appendChild(viewButton);
actionsCell.appendChild(statusSelect);
actionsCell.appendChild(updateButton);
actionsCell.appendChild(downloadPdfButton);


// REGISTER APPROVED APPLICATION

if (application.status === "Approved") {

    const registerLearnerButton =
        document.createElement("button");

    registerLearnerButton.type = "button";

    if (application.registered_learner_id) {

        registerLearnerButton.textContent =
            "Learner Registered";

        registerLearnerButton.disabled = true;

    } else {

        registerLearnerButton.textContent =
            "Register Learner";

        registerLearnerButton.addEventListener(
            "click",
            function () {

                window.dispatchEvent(
                    new CustomEvent(
                        "malizayo:register-approved-admission",
                        {
                            detail: {
                                application: application
                            }
                        }
                    )
                );

            }
        );

    }

    actionsCell.appendChild(registerLearnerButton);

}


// APPEND ROW
// APPEND ROW

row.appendChild(actionsCell);

admissionsTableBody.appendChild(row);

// CLOSE APPLICATIONS LOOP
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


/* =========================================
   DOWNLOAD COMPLETED ADMISSION APPLICATION
========================================= */

// Safely display information inside HTML
function escapeAdmissionPdfText(value) {

    const text =
        value === null ||
        value === undefined ||
        value === ""
            ? "Not provided"
            : String(value);

    return text.replace(/[&<>"']/g, function (character) {

        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[character];

    });

}


// Generate and print the admission form
async function downloadAdmissionApplicationPdf(
    application,
    button
) {

    // Open the print window immediately from the button click
    const printWindow = window.open("", "_blank");

    if (!printWindow) {

        if (adminNotice) {
            adminNotice.textContent =
                "Please allow pop-ups to download the admission PDF.";
        }

        return;
    }


    button.disabled = true;
    button.textContent = "Preparing PDF...";


    try {

        // APPLICATION REFERENCE

        const reference =
            "MPS-" +
            application.id.slice(0, 8).toUpperCase();


        // DATE SUBMITTED

        const submittedDate =
            application.submitted_at
                ? new Date(
                    application.submitted_at
                ).toLocaleString("en-ZA")
                : "Not provided";


        // GET PRIVATE SIGNATURE IMAGE

        let signatureUrl = "";

        if (application.signature_path) {

            const { data, error } =
                await sharedSupabase.storage
                    .from(admissionsBucket)
                    .createSignedUrl(
                        application.signature_path,
                        300
                    );

            if (error) {
                throw error;
            }

            signatureUrl = data.signedUrl;

        }


        // SIGNATURE DISPLAY

        const signatureMarkup = signatureUrl
            ? `
                <div class="signature-image">
                    <img
                        id="parentSignature"
                        src="${escapeAdmissionPdfText(signatureUrl)}"
                        alt="Parent or guardian signature"
                    >
                </div>
            `
            : `
                <p>No signature image uploaded.</p>
            `;


        // CREATE PDF DOCUMENT CONTENT

        const html = `

        <!DOCTYPE html>

        <html lang="en">

        <head>

            <meta charset="UTF-8">

            <meta name="viewport" content="width=device-width, initial-scale=1.0">

            <title>${reference}-Admission-Application</title>

            <style>

                @page {
                    size: A4;
                    margin: 18mm;
                }

                * {
                    box-sizing: border-box;
                }

                body {
                    font-family: Arial, sans-serif;
                    color: #222;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .school-header {
                    text-align: center;
                    border-bottom: 3px solid #173B5C;
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }

                .school-header h1 {
                    color: #173B5C;
                    font-size: 22px;
                    margin: 0;
                }

                .school-header p {
                    margin: 4px 0;
                }

                .document-title {
                    text-align: center;
                    margin: 20px 0;
                }

                .document-title h2 {
                    color: #173B5C;
                    font-size: 17px;
                }

                .reference {
                    font-weight: bold;
                    font-size: 13px;
                }

                .section {
                    margin-top: 20px;
                    page-break-inside: avoid;
                }

                .section h3 {
                    background: #173B5C;
                    color: white;
                    padding: 9px;
                    font-size: 13px;
                }

                table {
                    width: 100%;
                    border-collapse: collapse;
                }

                td {
                    border: 1px solid #ccc;
                    padding: 9px;
                    vertical-align: top;
                }

                td:first-child {
                    width: 35%;
                    font-weight: bold;
                    background: #f3f5f7;
                }

                .declaration {
                    margin-top: 20px;
                    padding: 12px;
                    border: 1px solid #ccc;
                }

                .signature-image {
                    margin-top: 10px;
                }

                .signature-image img {
                    max-width: 220px;
                    max-height: 85px;
                    object-fit: contain;
                }

                .signature-line {
                    border-bottom: 1px solid #333;
                    width: 250px;
                    margin-top: 30px;
                }

                .footer {
                    margin-top: 30px;
                    padding-top: 10px;
                    border-top: 1px solid #ccc;
                    text-align: center;
                    color: #555;
                    font-size: 10px;
                }

                @media print {

                    body {
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }

                }

            </style>

        </head>

        <body>

            <div class="school-header">

                <h1>Malizayo Primary School</h1>

                <p>Official Learner Admission Application</p>

                <p>Mid Illovo, KwaZulu-Natal</p>

            </div>


            <div class="document-title">

                <h2>COMPLETED ADMISSION APPLICATION FORM</h2>

                <p class="reference">
                    Reference: ${escapeAdmissionPdfText(reference)}
                </p>

            </div>


            <div class="section">

                <h3>SECTION A: LEARNER INFORMATION</h3>

                <table>

                    <tr>
                        <td>Full Name</td>
                        <td>${escapeAdmissionPdfText(application.learner_name)}</td>
                    </tr>

                    <tr>
                        <td>Date of Birth</td>
                        <td>${escapeAdmissionPdfText(application.date_of_birth)}</td>
                    </tr>

                    <tr>
                        <td>Grade Applying For</td>
                        <td>${escapeAdmissionPdfText(application.grade_applying_for)}</td>
                    </tr>

                    <tr>
                        <td>Previous School</td>
                        <td>${escapeAdmissionPdfText(application.previous_school)}</td>
                    </tr>

                </table>

            </div>


            <div class="section">

                <h3>SECTION B: PARENT / GUARDIAN INFORMATION</h3>

                <table>

                    <tr>
                        <td>Parent / Guardian Name</td>
                        <td>${escapeAdmissionPdfText(application.parent_guardian_name)}</td>
                    </tr>

                    <tr>
                        <td>Relationship to Learner</td>
                        <td>${escapeAdmissionPdfText(application.relationship_to_learner)}</td>
                    </tr>

                    <tr>
                        <td>Contact Number</td>
                        <td>${escapeAdmissionPdfText(application.parent_phone)}</td>
                    </tr>

                    <tr>
                        <td>Email Address</td>
                        <td>${escapeAdmissionPdfText(application.parent_email)}</td>
                    </tr>

                    <tr>
                        <td>Residential Address</td>
                        <td>${escapeAdmissionPdfText(application.residential_address)}</td>
                    </tr>

                </table>

            </div>


            <div class="section">

                <h3>SECTION C: DECLARATION AND SIGNATURE</h3>

                <div class="declaration">

                    <p>
                        Declaration accepted:
                        <strong>
                            ${
                                application.declaration_accepted
                                    ? "YES"
                                    : "NOT CONFIRMED"
                            }
                        </strong>
                    </p>

                    <p>
                        Name of person signing:
                        <strong>
                            ${escapeAdmissionPdfText(application.signature_name)}
                        </strong>
                    </p>

                    <p>Parent / Guardian Signature:</p>

                    ${signatureMarkup}

                    <div class="signature-line"></div>

                </div>

            </div>


            <div class="section">

                <h3>SECTION D: ADMINISTRATIVE INFORMATION</h3>

                <table>

                    <tr>
                        <td>Application Status</td>
                        <td>${escapeAdmissionPdfText(application.status)}</td>
                    </tr>

                    <tr>
                        <td>Date Submitted</td>
                        <td>${escapeAdmissionPdfText(submittedDate)}</td>
                    </tr>

                    <tr>
                        <td>Application Reference</td>
                        <td>${escapeAdmissionPdfText(reference)}</td>
                    </tr>

                </table>

            </div>


            <div class="footer">

                Malizayo Primary School

                <br>

                Digitally generated copy of the information submitted
                through the school's admissions system.

            </div>

        </body>

        </html>

        `;


        // WRITE DOCUMENT TO THE PRINT WINDOW

        printWindow.document.open();

        printWindow.document.write(html);

        printWindow.document.close();


        // WAIT FOR THE SIGNATURE IMAGE TO LOAD

        const signatureImage =
            printWindow.document.getElementById(
                "parentSignature"
            );

        if (signatureImage) {

            await new Promise(function (resolve) {

                if (signatureImage.complete) {
                    resolve();
                    return;
                }

                signatureImage.onload = resolve;
                signatureImage.onerror = resolve;

                setTimeout(resolve, 5000);

            });

        }


        // OPEN PRINT DIALOG

        printWindow.focus();

        printWindow.print();


        if (adminNotice) {

            adminNotice.textContent =
                "Admission PDF prepared successfully. Choose Save as PDF to download.";

        }


    } catch (error) {

        console.error(
            "Admission PDF generation failed:",
            error
        );

        printWindow.close();

        if (adminNotice) {

            adminNotice.textContent =
                "Unable to generate admission PDF: " +
                error.message;

        }

    } finally {

        button.disabled = false;
        button.textContent = "Download PDF";

    }

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
// =====================================
// REFRESH ADMISSIONS AFTER REGISTRATION
// =====================================

window.addEventListener(
    "malizayo:admission-registered",
    async function (event) {

        try {

            await loadAdminApplications();

            if (adminNotice) {

                const admissionNumber =
                    event.detail?.admissionNumber || "";

                adminNotice.textContent =
                    "Learner successfully registered. Admission number: " +
                    admissionNumber;

            }

        } catch (error) {

            console.error(
                "Admissions refresh failed:",
                error
            );

            if (adminNotice) {
                adminNotice.textContent =
                    "Learner registered, but the admissions list could not refresh. Please reload the page.";
            }

        }

    }
);

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
