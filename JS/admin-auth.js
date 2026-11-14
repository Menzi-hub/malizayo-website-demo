
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   ADMINISTRATOR AUTHENTICATION
===================================== */

(function () {

    const supabase = window.malizayoSupabase;

    const loginPanel =
        document.getElementById("adminLoginPanel");

    const passwordPanel =
        document.getElementById("adminPasswordSetupPanel");

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
   const forgotPasswordButton =
    document.getElementById("adminForgotPasswordButton");

    const passwordSetupForm =
        document.getElementById("adminPasswordSetupForm");

    const newPasswordInput =
        document.getElementById("adminNewPassword");

    const confirmPasswordInput =
        document.getElementById("adminConfirmPassword");

    const passwordSetupButton =
        document.getElementById("adminPasswordSetupButton");

    const passwordSetupMessage =
        document.getElementById("adminPasswordSetupMessage");


    // IMPORTANT:
    // Keep the same administrator UUID
    // already used in your Supabase SQL policies.

    const ADMIN_USER_ID =
        "a955d9d9-e91f-4fd9-b1e7-d015af08ae04";


    // Detect invitation and password recovery links

    const hashParameters = new URLSearchParams(
        window.location.hash.replace(/^#/, "")
    );

    const queryParameters = new URLSearchParams(
        window.location.search
    );

    const authLinkType =
        hashParameters.get("type") ||
        queryParameters.get("type");

    const isPasswordSetupFlow =
        authLinkType === "invite" ||
        authLinkType === "recovery" ||
        queryParameters.has("code");


    // Display login screen

    function showLogin(message) {

        loginPanel.hidden = false;
        loginPanel.style.display = "flex";

        passwordPanel.hidden = true;
        passwordPanel.style.display = "none";

        dashboard.hidden = true;

        loginMessage.textContent = message || "";

    }


    // Display password creation screen

    function showPasswordSetup(message) {

        loginPanel.hidden = true;
        loginPanel.style.display = "none";

        passwordPanel.hidden = false;
        passwordPanel.style.display = "flex";

        dashboard.hidden = true;

        passwordSetupMessage.textContent =
            message || "Please create your administrator password.";

    }


    // Display administrator dashboard

    function showDashboard() {

        loginPanel.hidden = true;
        loginPanel.style.display = "none";

        passwordPanel.hidden = true;
        passwordPanel.style.display = "none";

        dashboard.hidden = false;

    }


    // Check required elements

    if (
        !supabase ||
        !loginPanel ||
        !passwordPanel ||
        !dashboard ||
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !loginMessage ||
       !forgotPasswordButton ||
        !passwordSetupForm ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !passwordSetupButton ||
        !passwordSetupMessage
    ) {

        console.error(
            "Administrator authentication could not initialise."
        );

        return;

    }


    // Keep dashboard hidden until authentication

    showLogin("Please sign in to continue.");
   // PASSWORD RECOVERY

forgotPasswordButton.addEventListener(
    "click",
    async function () {

        const email = emailInput.value.trim();

        if (!email) {
            loginMessage.textContent =
                "Please enter your administrator email first.";

            emailInput.focus();
            return;
        }

        forgotPasswordButton.disabled = true;
        forgotPasswordButton.textContent = "Sending...";

        loginMessage.style.color = "#536477";
        loginMessage.textContent = "Sending recovery email...";

        try {

            const { error } =
                await supabase.auth.resetPasswordForEmail(
                    email,
                    {
                        redirectTo:
                            "https://menzi-hub.github.io/malizayo-website-demo/admin.html"
                    }
                );

            if (error) {
                throw error;
            }

            loginMessage.style.color = "#216638";

            loginMessage.textContent =
                "If this account exists, a password recovery email has been sent. Check your inbox and spam folder.";

        } catch (error) {

            console.error(
                "Password recovery failed:",
                error
            );

            loginMessage.style.color = "#922E26";

            loginMessage.textContent =
                "Unable to send recovery email. Please try again.";

        } finally {

            forgotPasswordButton.disabled = false;

            forgotPasswordButton.textContent =
                "Forgot Password?";

        }

    }
);


    // NORMAL ADMINISTRATOR LOGIN

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


                if (
                    !data.user ||
                    data.user.id !== ADMIN_USER_ID
                ) {

                    await supabase.auth.signOut();

                    showLogin(
                        "This account is not authorised."
                    );

                    return;

                }


                loginForm.reset();

                showDashboard();


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


    // FIRST-TIME PASSWORD CREATION

    passwordSetupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            passwordSetupMessage.textContent = "";


            if (newPassword.length < 12) {

                passwordSetupMessage.textContent =
                    "Your password must contain at least 12 characters.";

                return;

            }


            if (newPassword !== confirmPassword) {

                passwordSetupMessage.textContent =
                    "The passwords do not match.";

                return;

            }


            passwordSetupButton.disabled = true;

            passwordSetupButton.textContent =
                "Saving password...";


            try {

                const { data: userData, error: userError } =
                    await supabase.auth.getUser();


                if (
                    userError ||
                    !userData.user ||
                    userData.user.id !== ADMIN_USER_ID
                ) {

                    throw new Error(
                        "Your invitation session is invalid or unauthorised. Please request a new invitation."
                    );

                }


                const { error } =
                    await supabase.auth.updateUser({

                        password: newPassword

                    });


                if (error) {
                    throw error;
                }


                passwordSetupForm.reset();

                // Remove authentication tokens from the URL

                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                );


                showDashboard();

                console.log(
                    "Malizayo administrator password created successfully."
                );


            } catch (error) {

                console.error(
                    "Password setup failed:",
                    error
                );

                passwordSetupMessage.textContent =
                    error.message ||
                    "Unable to save your password. Please try again.";

            } finally {

                passwordSetupButton.disabled = false;

                passwordSetupButton.textContent =
                    "Save Password";

            }

        }
    );


    // CHECK EXISTING ADMINISTRATOR SESSION

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


            // Invitation or recovery session:
            // require password creation first.

            if (isPasswordSetupFlow) {

                showPasswordSetup(
                    "Welcome. Please create your administrator password."
                );

                return;

            }


            // Existing administrator session

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


    // Handle authentication changes

    supabase.auth.onAuthStateChange(
        function (event) {

            if (event === "SIGNED_OUT") {

                showLogin(
                    "You have signed out."
                );

            }

            if (event === "PASSWORD_RECOVERY") {

                showPasswordSetup(
                    "Please create your new administrator password."
                );

            }

        }
    );


    // Start authentication checks

    checkExistingSession();


})();
