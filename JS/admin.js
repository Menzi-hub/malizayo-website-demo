

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

let editingAnnouncementId = null;

const announcementSubmitButton =
    announcementForm
        ? announcementForm.querySelector("button")
        : null;


// CHECK ADMINISTRATOR SESSION

async function verifyAnnouncementAdmin() {

    if (!sharedSupabase) {
        throw new Error("Database connection unavailable.");
    }

    const { data, error } =
        await sharedSupabase.auth.getUser();

    if (error || !data.user) {
        throw new Error(
            "Please sign in as the school administrator."
        );
    }

    return data.user;

}


// DISPLAY SHARED ANNOUNCEMENTS

function displayAdminAnnouncements(announcements) {

    if (!adminAnnouncementList) return;

    adminAnnouncementList.replaceChildren();

    if (!announcements || announcements.length === 0) {

        const emptyMessage =
            document.createElement("p");

        emptyMessage.textContent =
            "No shared announcements published yet.";

        adminAnnouncementList.appendChild(emptyMessage);

        return;

    }


    announcements.forEach(function (announcement) {

        const card =
            document.createElement("article");

        const heading =
            document.createElement("h4");

        const category =
            document.createElement("p");

        const publishedDate =
            document.createElement("p");

        const content =
            document.createElement("p");

        const editButton =
            document.createElement("button");

        const removeButton =
            document.createElement("button");


        heading.textContent = announcement.title;

        category.textContent = announcement.category;

        publishedDate.textContent =
            "Published: " +
            new Date(
                announcement.published_at
            ).toLocaleDateString("en-ZA");

        content.textContent = announcement.content;


        // EDIT ANNOUNCEMENT

        editButton.type = "button";

        editButton.textContent =
            "Edit Announcement";

        editButton.addEventListener("click", function () {

            editingAnnouncementId = announcement.id;

            announcementTitle.value =
                announcement.title;

            announcementCategory.value =
                announcement.category;

            announcementContent.value =
                announcement.content;

            announcementSubmitButton.textContent =
                "Update Announcement";

            announcementMessage.textContent =
                "Announcement loaded for editing.";

            announcementTitle.focus();

        });


        // REMOVE ANNOUNCEMENT

        removeButton.type = "button";

        removeButton.textContent =
            "Remove Announcement";

        removeButton.addEventListener(
            "click",
            async function () {

                if (!window.confirm(
                    "Are you sure you want to remove this announcement?"
                )) {
                    return;
                }

                removeButton.disabled = true;

                try {

                    await verifyAnnouncementAdmin();

                    const { data, error } =
                        await sharedSupabase
                            .from("announcements")
                            .delete()
                            .eq("id", announcement.id)
                            .select("id");

                    if (error) throw error;

                    if (!data || data.length === 0) {
                        throw new Error(
                            "The announcement was not removed. Check administrator permissions."
                        );
                    }

                    announcementMessage.textContent =
                        "Announcement removed from the shared database.";

                    await loadAdminAnnouncements();

                } catch (error) {

                    console.error(
                        "Announcement removal failed:",
                        error
                    );

                    announcementMessage.textContent =
                        error.message;

                    removeButton.disabled = false;

                }

            }
        );


        card.appendChild(heading);
        card.appendChild(category);
        card.appendChild(publishedDate);
        card.appendChild(content);
        card.appendChild(editButton);
        card.appendChild(removeButton);

        adminAnnouncementList.appendChild(card);

    });

}


// LOAD ANNOUNCEMENTS FROM DATABASE

async function loadAdminAnnouncements() {

    if (!adminAnnouncementList) return;

    try {

        await verifyAnnouncementAdmin();

        const { data, error } =
            await sharedSupabase
                .from("announcements")
                .select(
                    "id, title, category, content, published_at, is_published"
                )
                .order("published_at", {
                    ascending: false
                });

        if (error) throw error;

        displayAdminAnnouncements(data);

    } catch (error) {

        console.error(
            "Unable to load shared announcements:",
            error
        );

        adminAnnouncementList.textContent =
            "Unable to load announcements. Please sign in and try again.";

        announcementMessage.textContent =
            error.message;

    }

}


// PUBLISH OR UPDATE ANNOUNCEMENT

if (announcementForm) {

    announcementForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const title =
                announcementTitle.value.trim();

            const category =
                announcementCategory.value;

            const content =
                announcementContent.value.trim();


            if (!title || !category || !content) {

                announcementMessage.textContent =
                    "Please complete all announcement fields.";

                return;

            }


            if (title.length > 100 || content.length > 1000) {

                announcementMessage.textContent =
                    "The title or message exceeds the allowed length.";

                return;

            }


            announcementSubmitButton.disabled = true;

            announcementSubmitButton.textContent =
                editingAnnouncementId
                    ? "Updating..."
                    : "Publishing...";


            try {

                await verifyAnnouncementAdmin();

                let data;
                let error;

                if (editingAnnouncementId) {

                    // UPDATE EXISTING ANNOUNCEMENT
                    // Keep its original publication date.

                    const result =
                        await sharedSupabase
                            .from("announcements")
                            .update({
                                title: title,
                                category: category,
                                content: content,
                                updated_at: new Date().toISOString()
                            })
                            .eq("id", editingAnnouncementId)
                            .select("id");

                    data = result.data;
                    error = result.error;

                    if (!error && (!data || data.length === 0)) {
                        throw new Error(
                            "Announcement could not be updated. Check administrator permissions."
                        );
                    }

                } else {

                    // PUBLISH NEW ANNOUNCEMENT

                    const result =
                        await sharedSupabase
                            .from("announcements")
                            .insert({
                                title: title,
                                category: category,
                                content: content,
                                is_published: true
                            })
                            .select("id")
                            .single();

                    data = result.data;
                    error = result.error;

                }


                if (error) throw error;

                const wasEditing =
                    Boolean(editingAnnouncementId);

                editingAnnouncementId = null;

                announcementForm.reset();

                announcementMessage.textContent =
                    wasEditing
                        ? "Announcement updated successfully in the shared database."
                        : "Announcement published successfully to the shared database.";

                await loadAdminAnnouncements();


            } catch (error) {

                console.error(
                    "Announcement saving failed:",
                    error
                );

                announcementMessage.textContent =
                    error.message ||
                    "Unable to save announcement.";

            } finally {

                announcementSubmitButton.disabled = false;

                announcementSubmitButton.textContent =
                    editingAnnouncementId
                        ? "Update Announcement"
                        : "Publish Announcement";

            }

        }
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

            // Load on first page visit and after sign-in
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

            // Clear the list after sign-out
          // Clear sensitive admission information on sign-out

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

        }
    );

}


})();
