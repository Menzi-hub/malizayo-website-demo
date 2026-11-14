
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   SUPABASE DATABASE CONNECTION
===================================== */

(function () {

    // Your Supabase project URL
    const SUPABASE_URL =
        "https://pdxyppmsotygvzlekojg.supabase.co/rest/v1/";

    // Your Supabase publishable key
    const SUPABASE_PUBLISHABLE_KEY =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04 ";


    // Check whether the Supabase library loaded

    if (!window.supabase ||
        !window.supabase.createClient) {

        console.error(
            "Supabase library did not load."
        );

        return;
    }


    // Connect to the database

    window.malizayoSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    console.log(
        "Malizayo Supabase connection initialized."
    );

})();
