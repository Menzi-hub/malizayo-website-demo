
/* =========================================
   MALIZAYO PRIMARY SCHOOL
   LIVE HOMEPAGE ANNOUNCEMENTS
   SUPABASE DATABASE
========================================= */

(function () {

    "use strict";

    const db = window.malizayoSupabase;

    const announcementList =
        document.getElementById("publicAnnouncementList");


    // CHECK REQUIRED ELEMENTS

    if (!announcementList) {
        return;
    }


    // =====================================
    // CREATE SAFE HTML ELEMENTS
    // =====================================

    function createElement(tag, className, text) {

        const element =
            document.createElement(tag);

        if (className) {
            element.className = className;
        }

        element.textContent = text || "";

        return element;

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
    // LOAD PUBLISHED ANNOUNCEMENTS
    // =====================================

    async function loadSharedAnnouncements() {

        try {

            if (!db) {

                throw new Error(
                    "Supabase connection is unavailable."
                );

            }


            announcementList.replaceChildren();

            announcementList.appendChild(
                createElement(
                    "p",
                    "document-note",
                    "Loading school announcements..."
                )
            );


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


            announcementList.replaceChildren();


            // =====================================
            // NO PUBLISHED ANNOUNCEMENTS
            // =====================================

            if (!data || data.length === 0) {

                announcementList.appendChild(
                    createElement(
                        "p",
                        "document-note",
                        "There are currently no published school announcements."
                    )
                );

                return;

            }


            // =====================================
            // DISPLAY PUBLISHED ANNOUNCEMENTS
            // =====================================

            data.forEach(function (announcement) {

                const card =
                    createElement(
                        "article",
                        "announcement-card",
                        ""
                    );


                card.appendChild(
                    createElement(
                        "span",
                        "announcement-date",
                        announcement.category
                    )
                );


                card.appendChild(
                    createElement(
                        "h3",
                        "",
                        announcement.title
                    )
                );


                card.appendChild(
                    createElement(
                        "small",
                        "announcement-published-date",
                        "Published: " +
                            formatDate(
                                announcement.published_at
                            )
                    )
                );


                card.appendChild(
                    createElement(
                        "p",
                        "",
                        announcement.content
                    )
                );


                announcementList.appendChild(card);

            });


            console.log(
                "Homepage announcements loaded successfully.",
                {
                    count: data.length
                }
            );


        } catch (error) {

            console.error(
                "Homepage announcements failed:",
                error
            );


            announcementList.replaceChildren();

            announcementList.appendChild(
                createElement(
                    "p",
                    "document-note",
                    "School announcements are temporarily unavailable. Please try again later."
                )
            );

        }

    }


    // INITIALISE

    loadSharedAnnouncements();

})();
