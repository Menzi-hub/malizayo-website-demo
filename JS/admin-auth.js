
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   ADMINISTRATOR AUTHENTICATION
===================================== */

(function () {

    const supabase = window.malizayoSupabase;

    const loginPanel =
        document.getElementById("adminLoginPanel");

    const dashboard =
        document.getElementById("adminDashboard");

    const loginForm =
        document.getElementById("adminLoginForm");

    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const loginButton =
        document.getElementById("adminLoginButton");

    const loginMessage =
        document.getElementById("adminLoginMessage");


    // Use the same administrator UUID
    // that was used in the Supabase security policies.

    const ADMIN_USER_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";


    function showLogin(message) {

        loginPanel.style.display = "flex";

        dashboard.hidden = true;

        loginMessage.textContent = message || "";

    }


    function showDashboard() {

        loginPanel.style.display = "none";

        dashboard.hidden = false;

    }


    // Check required elements

    if (
        !supabase ||
        !loginPanel ||
        !dashboard ||
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !loginMessage
    ) {

        console.error(
            "Admin authentication could not initialise."
        );

        return;

    }


    // Keep dashboard hidden initially

    showLogin("Please sign in to continue.");


    // Authenticate administrator

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email = emailInput.value.trim();

            const password = passwordInput.value;

            loginButton.disabled = true;

            loginButton.textContent = "Signing in...";

            loginMessage.textContent = "";


            try {

                const { data, error } =
                    await supabase.auth.signInWithPassword({

                        email: email,

                        password: password

                    });


                if (error) {
                    throw error;
                }


                // Check the actual authenticated account

                if (
                    !data.user ||
                    data.user.id !== ADMIN_USER_ID
                ) {

                    await supabase.auth.signOut();

                    showLogin(
                        "This account is not authorised to access the administrator dashboard."
                    );

                    return;

                }


                loginForm.reset();

                showDashboard();

                console.log(
                    "Malizayo administrator signed in successfully."
                );


            } catch (error) {

                console.error(
                    "Administrator sign-in failed:",
                    error
                );

                showLogin(
                    "Sign-in failed. Please check your email and password."
                );

            } finally {

                loginButton.disabled = false;

                loginButton.textContent = "Sign In";

            }

        }
    );


    // Verify an existing session when the page opens

    async function checkExistingSession() {

        try {

            const { data, error } =
                await supabase.auth.getUser();

            if (error || !data.user) {

                showLogin(
                    "Please sign in to continue."
                );

                return;

            }


            if (data.user.id !== ADMIN_USER_ID) {

                await supabase.auth.signOut();

                showLogin(
                    "This account is not authorised."
                );

                return;

            }


            showDashboard();

            console.log(
                "Existing administrator session verified."
            );

        } catch (error) {

            console.error(
                "Unable to verify administrator session:",
                error
            );

            showLogin(
                "Please sign in again."
            );

        }

    }


    // Display login screen after sign-out

    supabase.auth.onAuthStateChange(function (event) {

        if (event === "SIGNED_OUT") {

            showLogin("You have signed out.");

        }

    });


    checkExistingSession();


})();
