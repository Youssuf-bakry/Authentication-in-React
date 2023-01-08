import { useState, useContext, useRef } from "react";
import AuthContext from "../../store/auth-context";
import LoadingSpinner from "../Layout/LoadingSpinner";
import { useHistory } from "react-router-dom";
import classes from "./AuthForm.module.css";

const AuthForm = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const enteredEmailRef = useRef();
  const enteredPassRef = useRef();
  const history = useHistory();
  const authCtx = useContext(AuthContext);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitFormHandler = (e) => {
    e.preventDefault();
    const enteredEmail = enteredEmailRef.current.value;
    const enteredPass = enteredPassRef.current.value;

    //Optional Validation (simple & out of the scope of this projcet)

    // checking if logged or not
    setIsLoading(true);
    let url;
    if (isLogin) {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBIdqg2pWk5MhHNqulQUsCkf1g-PUXzTis";
    } else {
      url =
        "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBIdqg2pWk5MhHNqulQUsCkf1g-PUXzTis";
    }
    fetch(url, {
      method: "POST",
      body: JSON.stringify({
        email: enteredEmail,
        password: enteredPass,
        returnSecureToken: true,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((response) => {
        setIsLoading(false);
        if (response.ok) {
          //do something
          return response.json();
        } else {
          return response.json().then((data) => {
            let errorMessage = "Auth Failed";
            //show error message data && data.error && data.error.message
            if (data?.error?.message) errorMessage = data.error.message;
            throw new Error(errorMessage);
          });
        }
      })
      .then((data) => {
        //! Max approach in dealing with dates as strings and no
        // const expirationTime = new Date(
        //   new Date().getTime() + +data.expiresIn * 1000
        // );
        // authCtx.logInHandler(data.idToken, expirationTime.toISOString());

        //* better easier approach
        authCtx.login(data.idToken, Date.now() + data.expiresIn * 1000);
        history.replace("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitFormHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Your Email</label>
          <input type="email" id="email" ref={enteredEmailRef} required />
        </div>
        <div className={classes.control}>
          <label htmlFor="password">Your Password</label>
          <input type="password" id="password" ref={enteredPassRef} required />
        </div>
        <div className={classes.actions}>
          {!isLoading && (
            <button>{isLogin ? "Login" : "Create Account"}</button>
          )}
          {isLoading && <LoadingSpinner />}
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
