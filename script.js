const MERCHANT_GATE = "2347081485609";
const CURR_SYMBOL = "₦";
const INC_MODE = "float";

document.addEventListener("DOMContentLoaded", () => {
    const cart = [];
    const cartDrawer = document.getElementById("cart-drawer");
    const cartToggle = document.getElementById("floating-cart-badge");
    const closeCart = document.getElementById("close-cart");
    const cartContainer = document.getElementById("cart-items-container");
    const cartTotalEl = document.getElementById("cart-total-price");
    const cartCountEl = document.getElementById("cart-count");
    const checkoutBtn = document.getElementById("whatsapp-checkout-btn");
    const searchInput = document.getElementById("catalog-search");
    const fallback = document.getElementById("search-fallback");
    const resetBtn = document.getElementById("reset-catalog-btn");
    const tabBtns = [...document.querySelectorAll(".tab-btn")];
    const menuCategories = [...document.querySelectorAll(".menu-category")];

    if (cartToggle && cartDrawer) {
        cartToggle.addEventListener("click", () => cartDrawer.classList.add("open"));
    }
    if (closeCart && cartDrawer) {
        closeCart.addEventListener("click", () => cartDrawer.classList.remove("open"));
    }

    function renderCart() {
        if (!cartContainer) return;
        cartContainer.replaceChildren();

        if (cart.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.className = "empty-cart-msg";
            emptyMessage.textContent = "Your basket is empty.";
            cartContainer.appendChild(emptyMessage);
            if (cartTotalEl) cartTotalEl.textContent = CURR_SYMBOL + "0";
            if (cartCountEl) cartCountEl.textContent = "0";
            if (checkoutBtn) checkoutBtn.disabled = true;
            return;
        }

        let total = 0;
        let count = 0;
        cart.forEach((item, index) => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            count += item.isService ? 1 : item.quantity;

            const row = document.createElement("div");
            row.className = "cart-item-row";
            const details = document.createElement("div");
            details.className = "cart-item-details";
            const title = document.createElement("h4");
            title.textContent = item.name;
            const description = document.createElement("span");
            const quantityLabel = item.isService
                ? "Appointment Booking"
                : (INC_MODE === "float" ? item.quantity.toFixed(1) : item.quantity) + " units";
            description.textContent = quantityLabel + " @ " + CURR_SYMBOL + item.price.toLocaleString();
            details.append(title, description);

            const actions = document.createElement("div");
            const amount = document.createElement("span");
            amount.style.fontWeight = "600";
            amount.style.marginRight = "10px";
            amount.textContent = CURR_SYMBOL + subtotal.toLocaleString();
            const removeButton = document.createElement("button");
            removeButton.className = "remove-btn";
            removeButton.type = "button";
            removeButton.textContent = "×";
            removeButton.setAttribute("aria-label", "Remove " + item.name);
            removeButton.addEventListener("click", () => {
                cart.splice(index, 1);
                renderCart();
            });
            actions.append(amount, removeButton);
            row.append(details, actions);
            cartContainer.appendChild(row);
        });

        if (cartTotalEl) cartTotalEl.textContent = CURR_SYMBOL + total.toLocaleString();
        if (cartCountEl) cartCountEl.textContent = INC_MODE === "float" ? count.toFixed(1) : String(count);
        if (checkoutBtn) checkoutBtn.disabled = false;
    }

    document.querySelectorAll(".food-card").forEach(card => {
        const minus = card.querySelector(".minus-btn");
        const plus = card.querySelector(".plus-btn");
        const quantityInput = card.querySelector(".quantity-input");
        const addButton = card.querySelector(".add-to-cart-btn");
        const name = card.dataset.name || "Item";
        const price = Number(card.dataset.price);
        const isService = addButton?.dataset.type === "services";
        const minimum = INC_MODE === "float" ? 0.5 : 1;
        const step = INC_MODE === "float" ? 0.5 : 1;

        if (plus && quantityInput) {
            plus.addEventListener("click", () => {
                const current = Number(quantityInput.value);
                quantityInput.value = String((Number.isFinite(current) ? current : minimum) + step);
            });
        }
        if (minus && quantityInput) {
            minus.addEventListener("click", () => {
                const current = Number(quantityInput.value);
                quantityInput.value = String(Math.max(minimum, (Number.isFinite(current) ? current : minimum) - step));
            });
        }
        if (addButton) {
            addButton.addEventListener("click", () => {
                const quantity = isService ? 1 : Number(quantityInput?.value ?? 1);
                if (!Number.isFinite(price) || price < 0 || !Number.isFinite(quantity) || quantity < minimum) {
                    window.alert("Enter a valid quantity and item price.");
                    return;
                }
                const existing = cart.find(item => item.name === name && item.isService === isService);
                if (existing) existing.quantity += quantity;
                else cart.push({ name, price, quantity, isService });
                renderCart();
                if (quantityInput) quantityInput.value = INC_MODE === "float" ? "1.0" : "1";
            });
        }
    });

    function applyFilters(activeCategory = "all", query = "") {
        let visibleCount = 0;
        menuCategories.forEach(section => {
            const sectionCategory = section.dataset.sectionCategory;
            let sectionVisible = 0;
            section.querySelectorAll(".food-card").forEach(card => {
                const matches = (card.dataset.name || "").toLowerCase().includes(query) &&
                    (activeCategory === "all" || card.dataset.category === activeCategory);
                card.style.display = matches ? "block" : "none";
                if (matches) {
                    sectionVisible++;
                    visibleCount++;
                }
            });
            section.style.display = sectionVisible > 0 &&
                (activeCategory === "all" || sectionCategory === activeCategory) ? "block" : "none";
        });
        if (fallback) fallback.style.display = visibleCount === 0 ? "block" : "none";
    }

    let activeCategory = "all";
    if (searchInput) {
        searchInput.addEventListener("input", () => {
            applyFilters(activeCategory, searchInput.value.toLowerCase().trim());
        });
    }
    tabBtns.forEach(button => {
        button.addEventListener("click", () => {
            tabBtns.forEach(tab => tab.classList.remove("active"));
            button.classList.add("active");
            activeCategory = button.dataset.category || "all";
            applyFilters(activeCategory, searchInput?.value.toLowerCase().trim() || "");
        });
    });
    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if (searchInput) searchInput.value = "";
            activeCategory = "all";
            tabBtns.forEach(tab => tab.classList.toggle("active", tab.dataset.category === "all"));
            applyFilters();
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (!MERCHANT_GATE) {
                window.alert("The merchant WhatsApp number is not configured.");
                return;
            }
            const lines = ["📦 NEW ORDER", ""];
            let total = 0;
            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                total += subtotal;
                const quantity = INC_MODE === "float" ? item.quantity.toFixed(1) : item.quantity;
                const label = item.isService ? "[Appointment Booking]" : "(" + quantity + " units)";
                lines.push((index + 1) + ". *" + item.name + "* " + label + " - " + CURR_SYMBOL + subtotal.toLocaleString());
            });
            lines.push("", "💰 *Total:* " + CURR_SYMBOL + total.toLocaleString());
            window.location.href = "https://wa.me/" + MERCHANT_GATE + "?text=" + encodeURIComponent(lines.join("\n"));
        });
    }

    renderCart();
});