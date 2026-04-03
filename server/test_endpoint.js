async function testTrade() {
    try {
        console.log("Logging in...");
        const loginRes = await fetch('http://localhost:5000/api/login', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: 'v@v.com',
                password: 'v'
            })
        });

        if (!loginRes.ok) throw new Error("Login failed " + await loginRes.text());

        const loginData = await loginRes.json();
        const user = loginData.user;
        const token = loginData.token;
        console.log("Logged in! User ID:", user.id);

        console.log("Sending trade...");
        const tradeRes = await fetch('http://localhost:5000/api/trade', {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                userId: user.id,
                stock: "TCS.NS",
                type: "BUY",
                price: "100",
                quantity: 5,
                aiTag: "Normal"
            })
        });

        if (!tradeRes.ok) throw new Error("Trade failed " + await tradeRes.text());

        console.log("Trade success:", await tradeRes.json());
    } catch (err) {
        console.error("Error:", err.message);
    }
}

testTrade();
