

/* =====================================
   MALIZAYO ADMIN DASHBOARD
   DEMONSTRATION JAVASCRIPT
===================================== */

(function () {

    // Find all sample applications

    const applicationRows =
        document.querySelectorAll(
            ".admin-table tbody tr"
        );


    const applicationsCount =
        document.getElementById("applicationsCount");

    const documentsCount =
        document.getElementById("documentsCount");

    const reviewedCount =
        document.getElementById("reviewedCount");

    const adminNotice =
        document.getElementById("adminNotice");


    // Update the summary cards

    function updateDashboardCounts() {

        let pendingDocuments = 0;

        let reviewedApplications = 0;

        applicationRows.forEach(function (row) {

            const documentStatus =
                row.cells[3].textContent.trim();

            const applicationStatus =
                row.querySelector(
                    "[data-application-status]"
                ).textContent.trim();


            if (documentStatus === "Documents Needed") {
                pendingDocuments++;
            }

            if (applicationStatus === "Approved") {
                reviewedApplications++;
            }

        });


        if (applicationsCount) {
            applicationsCount.textContent =
                applicationRows.length;
        }

        if (documentsCount) {
            documentsCount.textContent =
                pendingDocuments;
        }

        if (reviewedCount) {
            reviewedCount.textContent =
                reviewedApplications;
        }

    }


    // VIEW APPLICATION BUTTON

    document.querySelectorAll(
        ".view-application-btn"
    ).forEach(function (button) {

        button.addEventListener("click", function () {

            const row = button.closest("tr");

            const reference =
                row.dataset.application;

            const learner =
                row.cells[1].textContent;

            const grade =
                row.cells[2].textContent;

            const documents =
                row.cells[3].textContent;

            const status =
                row.querySelector(
                    "[data-application-status]"
                ).textContent.trim();


            alert(
                "SAMPLE APPLICATION DETAILS\n\n" +
                "Reference: " + reference + "\n" +
                "Learner: " + learner + "\n" +
                "Grade: " + grade + "\n" +
                "Documents: " + documents + "\n" +
                "Status: " + status + "\n\n" +
                "This is a fictional demonstration record."
            );

        });

    });


    // UPDATE APPLICATION STATUS

    document.querySelectorAll(
        ".update-status-btn"
    ).forEach(function (button) {

        button.addEventListener("click", function () {

            const row = button.closest("tr");

            const reference =
                row.dataset.application;

            const select =
                row.querySelector(".status-choice");

            const newStatus = select.value;

            const statusLabel =
                row.querySelector(
                    "[data-application-status]"
                );


            // Assign the correct status style

            const statusStyles = {

                "Pending Review": "status-pending",

                "Under Review": "status-review",

                "Approved": "status-approved",

                "Awaiting Documents": "status-documents"

            };


            statusLabel.textContent = newStatus;

            statusLabel.className =
                "status-pill " +
                statusStyles[newStatus];


            // Refresh dashboard figures

            updateDashboardCounts();


            // Show a confirmation

            adminNotice.textContent =
                reference + " status changed to " +
                newStatus +
                ". Demonstration only; changes are not saved.";

        });

    });


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


  // Display initial summary figures

updateDashboardCounts();



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


// LOAD WHEN ADMINISTRATOR SIGNS IN

if (sharedSupabase) {

    sharedSupabase.auth.onAuthStateChange(
        function (event) {

            if (event === "SIGNED_IN") {

                // Run after the authentication callback finishes.
                window.setTimeout(
                    loadAdminAnnouncements,
                    0
                );

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

                window.setTimeout(
                    loadAdminAnnouncements,
                    0
                );

            }

            if (event === "SIGNED_OUT") {

                adminAnnouncementList.replaceChildren();

                announcementMessage.textContent =
                    "Please sign in to manage announcements.";

        



})();
