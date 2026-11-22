
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE PUBLIC SCHOOL ANNOUNCEMENTS
   SUPABASE DATABASE
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const announcementGrid =
        document.getElementById(
            "publicAnnouncementsGrid"
        );

    const announcementStatus =
        document.getElementById(
            "publicAnnouncementsStatus"
        );


    // CHECK REQUIRED CONNECTIONS

    if (!db || !announcementGrid) {

        console.error(
            "Public announcements could not initialise."
        );

        if (announcementStatus) {
            announcementStatus.textContent =
                "School announcements are temporarily unavailable.";
        }

        return;

    }


    // =====================================
    // FORMAT PUBLICATION DATE
    // =====================================

    function formatDate(value) {

        if (!value) {
            return "Date unavailable";
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return "Date unavailable";
        }

        return date.toLocaleDateString(
            "en-ZA",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    }


    // =====================================
    // CREATE SAFE HTML ELEMENTS
    // =====================================

    function createElement(
        tag,
        className,
        text
    ) {

        const element =
            document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text || "";

        return element;

    }


    // =====================================
    // LOAD PUBLISHED ANNOUNCEMENTS
    // =====================================

    async function loadAnnouncements() {

        try {

            if (announcementStatus) {
                announcementStatus.textContent =
                    "Loading school announcements...";
            }


            const {
                data,
                error
            } = await db
                .from("announcements")
                .select(`
                    id,
                    title,
                    category,
                    content,
                    published_at
                `)
                .eq("is_published", true)
                .order("published_at", {
                    ascending: false
                });


            if (error) {
                throw error;
            }


            // CLEAR DEMONSTRATION CONTENT

            announcementGrid.replaceChildren();


            // =====================================
            // NO PUBLISHED ANNOUNCEMENTS
            // =====================================

            if (!data || data.length === 0) {

                announcementGrid.appendChild(
                    createElement(
                        "p",
                        "document-note",
                        "There are currently no published school announcements."
                    )
                );

                if (announcementStatus) {
                    announcementStatus.textContent =
                        "School announcements are up to date.";
                }

                return;

            }


            // =====================================
            // DISPLAY EACH ANNOUNCEMENT
            // =====================================

            data.forEach(function (announcement) {

                const card =
                    createElement(
                        "article",
                        "news-card",
                        ""
                    );


                // CATEGORY

                card.appendChild(
                    createElement(
                        "span",
                        "news-category",
                        announcement.category
                    )
                );


                // TITLE

                card.appendChild(
                    createElement(
                        "h3",
                        "",
                        announcement.title
                    )
                );


                // PUBLICATION DATE

                card.appendChild(
                    createElement(
                        "p",
                        "news-date",
                        "Published: " +
                            formatDate(
                                announcement.published_at
                            )
                    )
                );


                // ANNOUNCEMENT CONTENT

                card.appendChild(
                    createElement(
                        "p",
                        "",
                        announcement.content
                    )
                );


                announcementGrid.appendChild(card);

            });


            if (announcementStatus) {

                announcementStatus.textContent =
                    data.length +
                    (
                        data.length === 1
                            ? " published announcement."
                            : " published announcements."
                    );

            }


            console.log(
                "Malizayo public announcements loaded successfully.",
                {
                    announcementCount: data.length
                }
            );


        } catch (error) {

            console.error(
                "Public announcement loading failed:",
                error
            );


            announcementGrid.replaceChildren();

            announcementGrid.appendChild(
                createElement(
                    "p",
                    "document-note",
                    "School announcements are temporarily unavailable. Please try again later."
                )
            );


            if (announcementStatus) {
                announcementStatus.textContent =
                    "Unable to retrieve school announcements.";
            }

        }

    }


    // INITIALISE

    loadAnnouncements();


})();
