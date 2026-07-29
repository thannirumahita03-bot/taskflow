import { useState } from "react";
import "./styles/login.css";

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const handleSubmit = async () => {

    setMessage("");

    if (!isLogin) {

      if (password !== confirmPassword) {
        setMessage("Passwords do not match");
        return;
      }

      setLoading(true);

      const response = await fetch(
        "http://127.0.0.1:8000/register",
        {
          method: "POST",
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            username,
            password
          })
        }
      );

      const data = await response.json();

      setLoading(false);

      if (response.ok) {

        setMessage("Account created successfully!");

        setIsLogin(true);

        setPassword("");
        setConfirmPassword("");

      } else {

        setMessage(data.detail || "Registration Failed");

      }

      return;
    }

    setLoading(true);

    const response = await fetch(
      "http://127.0.0.1:8000/login",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          username,
          password
        })
      }
    );

    const data = await response.json();

    setLoading(false);

    if(data.access_token){

      localStorage.setItem(
        "token",
        data.access_token
      );

      window.location.reload();

    }else{

      setMessage(
        data.detail || "Invalid Login"
      );

    }

  };

  return (

<div className="login-page">

<div className="login-card">

<h1>🚀 TaskFlow</h1>

<p>
Manage your tasks.
</p>

<div className="tabs">

<button
className={
isLogin ? "active":""
}
onClick={()=>setIsLogin(true)}
>

Sign In

</button>

<button
className={
!isLogin ? "active":""
}
onClick={()=>setIsLogin(false)}
>

Create Account

</button>

</div>

<input
placeholder="Username"
value={username}
onChange={(e)=>
setUsername(e.target.value)
}
/>

<input
type="password"
placeholder="Password"
value={password}
onChange={(e)=>
setPassword(e.target.value)
}
/>

{
!isLogin &&

<input
type="password"
placeholder="Confirm Password"
value={confirmPassword}
onChange={(e)=>
setConfirmPassword(e.target.value)
}
/>

}

<button
className="submit-btn"
onClick={handleSubmit}
disabled={loading}
>

{
loading
?
"Please Wait..."
:
isLogin
?
"Login"
:
"Create Account"
}

</button>

<p className="message">

{message}

</p>

</div>

</div>

  );

}