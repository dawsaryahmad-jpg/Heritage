
const MERCHANT_GATE = "2347081485609";
const CURR_SYMBOL = "₦";
const INC_MODE = "float";
let cart = [];

document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("catalog-search");
    const tabButtons = document.querySelectorAll(".tab-btn");
    const menuSections = document.querySelectorAll(".menu-category");
    const productCards = document.querySelectorAll(".food-card");
    const cartDrawer = document.getElementById("cart-drawer");
    const cartToggle = document.getElementById("floating-cart-badge");
    const closeCart = document.getElementById("close-cart");
    const cartContainer = document.getElementById("cart-items-container");
    const cartTotalEl = document.getElementById("cart-total-price");
    const cartCountEl = document.getElementById("cart-count");
    const checkoutBtn = document.getElementById("whatsapp-checkout-btn");
    const fallback = document.getElementById("search-fallback");
    const resetBtn = document.getElementById("reset-catalog-btn");

    if (searchInput && menuSections.length > 0) {
        let activeCategory = "all";
        let currentQuery = "";

        function filterCards() {
            let totalVisible = 0;
            menuSections.forEach((section) => {
                let visibleInSection = 0;
                section.querySelectorAll(".food-card").forEach((card) => {
                    const name = card.getAttribute("data-name").toLowerCase();
                    const category = card.getAttribute("data-category");
                    if (name.includes(currentQuery) && (activeCategory === "all" || category === activeCategory)) {
                        card.style.display = "block";
                        visibleInSection += 1;
                        totalVisible += 1;
                    } else {
                        card.style.display = "none";
                    }
                });
                section.style.display = visibleInSection > 0 ? "block" : "none";
            });

            if (fallback) fallback.style.display = totalVisible === 0 ? "block" : "none";
        }

        searchInput.addEventListener("keyup", (event) => {
            currentQuery = event.target.value.toLowerCase().trim();
            filterCards();
        });

        tabButtons.forEach((button) => {
            button.addEventListener("click", (event) => {
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                event.target.classList.add("active");
                activeCategory = event.target.getAttribute("data-category");
                filterCards();
            });
        });

        if (resetBtn) {
            resetBtn.addEventListener("click", () => {
                searchInput.value = "";
                currentQuery = "";
                activeCategory = "all";
                tabButtons.forEach((btn) => btn.classList.remove("active"));
                if (tabButtons.length > 0) tabButtons[0].classList.add("active");
                filterCards();
            });
        }
    }

    if (cartToggle && cartDrawer && closeCart) {
        cartToggle.addEventListener("click", () => cartDrawer.classList.add("open"));
        closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));
    }

    if (productCards.length > 0) {
        productCards.forEach((card) => {
            const minus = card.querySelector(".minus-btn");
            const plus = card.querySelector(".plus-btn");
            const qty = card.querySelector(".quantity-input");
            const addBtn = card.querySelector(".add-to-cart-btn");
            const name = card.getAttribute("data-name");
            const price = Number.parseFloat(card.getAttribute("data-price"));

            if (plus && qty) {
                plus.addEventListener("click", () => {
                    const currentValue = Number.parseFloat(qty.value);
                    qty.value = INC_MODE === "float" ? (currentValue + 0.5).toFixed(1) : (Number.parseInt(qty.value, 10) + 1);
                });
            }

            if (minus && qty) {
                minus.addEventListener("click", () => {
                    const currentValue = Number.parseFloat(qty.value);
                    const lowerLimit = INC_MODE === "float" ? 0.5 : 1;
                    if (currentValue > lowerLimit) {
                        qty.value = INC_MODE === "float" ? (currentValue - 0.5).toFixed(1) : (Number.parseInt(qty.value, 10) - 1);
                    }
                });
            }

            if (addBtn && qty) {
                addBtn.addEventListener("click", () => {
                    const units = Number.parseFloat(qty.value);
                    const lowerLimit = INC_MODE === "float" ? 0.5 : 1;

                    if (Number.isNaN(units) || units < lowerLimit) {
                        alert("Please input a valid volume statement parameter.");
                        return;
                    }

                    const existingItem = cart.find((item) => item.name === name);
                    if (existingItem) {
                        existingItem.quantity += units;
                    } else {
                        cart.push({ name, price, quantity: units });
                    }

                    renderCart();
                    qty.value = INC_MODE === "float" ? "1.0" : "1";
                });
            }
        });
    }

    function renderCart() {
        if (!cartContainer) return;
        cartContainer.innerHTML = "";

        if (cart.length === 0) {
            cartContainer.innerHTML = "<p class='empty-cart-msg'>Your basket is empty.</p>";
            if (cartTotalEl) cartTotalEl.innerText = CURR_SYMBOL + "0";
            if (cartCountEl) cartCountEl.innerText = "0";
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        let totalCount = 0;

        cart.forEach((item) => {
            const subTotal = item.price * item.quantity;
            total += subTotal;
            totalCount += item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            const displayQty = INC_MODE === "float" ? item.quantity.toFixed(1) : item.quantity;
            row.innerHTML = '<div class="cart-item-details"><h4>' + item.name + '</h4><span>' + displayQty + ' @ ' + CURR_SYMBOL + item.price.toLocaleString() + '</span></div><div><span style="font-weight:600;margin-right:10px;">' + CURR_SYMBOL + subTotal.toLocaleString() + '</span><button class="remove-btn" data-name="' + item.name + '">&times;</button></div>';
            cartContainer.appendChild(row);
        });

        if (cartTotalEl) cartTotalEl.innerText = CURR_SYMBOL + total.toLocaleString();
        if (cartCountEl) cartCountEl.innerText = INC_MODE === "float" ? totalCount.toFixed(1) : totalCount;
        if (checkoutBtn) checkoutBtn.disabled = false;

        cartContainer.querySelectorAll(".remove-btn").forEach((button) => {
            button.addEventListener("click", (event) => {
                cart = cart.filter((entry) => entry.name !== event.target.getAttribute("data-name"));
                renderCart();
            });
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            let message = "📦 NEW PLATFORM MANIFEST ORDER

";
            let total = 0;

            cart.forEach((item, index) => {
                const subTotal = item.price * item.quantity;
                total += subTotal;
                const displayQty = INC_MODE === "float" ? item.quantity.toFixed(1) : item.quantity;
                message += (index + 1) + ". " + item.name + " (" + displayQty + ") - " + CURR_SYMBOL + subTotal.toLocaleString() + "
";
            });

            message += "
💰 Total Invoice Balance: " + CURR_SYMBOL + total.toLocaleString();
            const whatsappURL = "https://wa.me/" + MERCHANT_GATE + "?text=" + encodeURIComponent(message);
            console.log("mailto:dawsaryahmad@gmail.com?subject=" + encodeURIComponent("New order") + "&body=" + encodeURIComponent(message));
            window.location.href = whatsappURL;
        });
    }

    const revealTargets = document.querySelectorAll(".food-card, .menu-category");
    if (revealTargets.length > 0) {
        revealTargets.forEach((element) => element.classList.add("scroll-reveal"));
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.01, rootMargin: "0px 0px 40px 0px" });

        revealTargets.forEach((element) => observer.observe(element));
    }
});
