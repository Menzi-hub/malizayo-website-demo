
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   SHARED ANNOUNCEMENTS DISPLAY
===================================== */

(function () {

    const announcementList =
        document.getElementById("publicAnnouncementList");

    if (!announcementList) {
        return;
    }

    async function loadSharedAnnouncements() {

        try {

            const { data, error } =
                await window.malizayoSupabase
                    .from("announcements")
                    .select("id, title, category, content, published_at")
                    .eq("is_published", true)
                    .order("published_at", {
                        ascending: false
                    });

            if (error) {
                throw error;
            }

            // Keep local demonstration notices
            // if the shared table is still empty.

            if (!data || data.length === 0) {
                console.log(
                    "No shared announcements yet. Keeping demonstration notices."
                );
                return;
            }

            // Display shared announcements

            announcementList.replaceChildren();

            data.forEach(function (announcement) {

                const card =
                    document.createElement("article");

                card.className = "announcement-card";

                const category =
                    document.createElement("span");

                category.className = "announcement-date";
                category.textContent = announcement.category;

                const heading =
                    document.createElement("h3");

                heading.textContent = announcement.title;

                const publishedDate =
                    document.createElement("small");

                publishedDate.className =
                    "announcement-published-date";

                publishedDate.textContent =
                    announcement.published_at
                    ? "Published: " +
                      new Date(announcement.published_at)
                      .toLocaleDateString("en-ZA")
                    : "Date unavailable";

                const content =
                    document.createElement("p");

                content.textContent = announcement.content;

                card.appendChild(category);
                card.appendChild(heading);
                card.appendChild(publishedDate);
                card.appendChild(content);

                announcementList.appendChild(card);

            });

            console.log(
                "Shared announcements loaded successfully."
            );

        } catch (error) {

            console.error(
                "Unable to load shared announcements:",
                error
            );

        }

    }

    if (window.malizayoSupabase) {
        loadSharedAnnouncements();
    } else {
        console.error(
            "Supabase connection is not available."
        );
    }

})();
