const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".nav");
const themeButton = document.querySelector(".theme-toggle");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const cartItems = document.querySelector(".cart-items");
const addButtons = document.querySelectorAll(".add-to-cart");
const detailButtons = document.querySelectorAll(".view-details");
const checkoutButton = document.querySelector(".checkout-btn");
const modal = document.querySelector("#productModal");
const modalCloseButtons = document.querySelectorAll("[data-close-modal]");
const modalTitle = document.querySelector("#modalTitle");
const modalDescription = document.querySelector("#modalDescription");
const modalMaterial = document.querySelector("#modalMaterial");
const modalFit = document.querySelector("#modalFit");
const modalPrice = document.querySelector("#modalPrice");
const modalImage = document.querySelector(".modal-image");
const collectionTabs = document.querySelectorAll(".collection-tab");
const collectionSections = document.querySelectorAll(".collection-section");

const storageKeys = {
	theme: "atelier-theme",
	cart: "atelier-cart",
	collection: "atelier-collection",
};

const STRIPE_PAYMENT_LINK = "https://buy.stripe.com/test_4gw4gx7i4f2g4xq001";

const formatCurrency = (value) => `₦${value}`;

const getStoredCart = () => {
	try {
		return JSON.parse(localStorage.getItem(storageKeys.cart) || "[]");
	} catch {
		return [];
	}
};

let cart = getStoredCart();

const saveCart = () => {
	localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
};

const renderCart = () => {
	if (!cartItems || !cartCount || !cartTotal) {
		return;
	}

	if (cart.length === 0) {
		cartItems.innerHTML = "<li>Your cart is empty.</li>";
		cartCount.textContent = "0";
		cartTotal.textContent = "₦0";
		return;
	}

	cartItems.innerHTML = cart
		.map((item, index) => `<li><span>${item.name}</span><strong>${formatCurrency(item.price)}</strong><button class="remove-item" type="button" data-index="${index}" aria-label="Remove ${item.name}">&#x2715;</button></li>`)
		.join("");

	cartItems.querySelectorAll(".remove-item").forEach((btn) => {
		btn.addEventListener("click", () => {
			const index = Number(btn.dataset.index);
			const removed = cart.splice(index, 1)[0];
			saveCart();
			renderCart();
			showToast(`${removed.name} removed`);
		});
	});

	const total = cart.reduce((sum, item) => sum + item.price, 0);
	cartCount.textContent = String(cart.length);
	cartTotal.textContent = formatCurrency(total);
};

const applyTheme = (theme) => {
	const isDark = theme === "dark";
	document.body.classList.toggle("theme-dark", isDark);
	if (themeButton) {
		themeButton.setAttribute("aria-pressed", String(isDark));
		themeButton.textContent = isDark ? "Light" : "Dark";
	}
};

const openModal = (product) => {
	if (!modal || !modalTitle || !modalDescription || !modalMaterial || !modalFit || !modalPrice || !modalImage) {
		return;
	}

	modalTitle.textContent = product.dataset.name || "Product";
	modalDescription.textContent = product.dataset.description || "";
	modalMaterial.textContent = product.dataset.material || "Not specified";
	modalFit.textContent = product.dataset.fit || "Not specified";
	modalPrice.textContent = formatCurrency(Number(product.dataset.price || "0"));
	modalImage.src = product.dataset.image || "";
	modalImage.alt = `${product.dataset.name || "Product"} close view`;

	modal.classList.remove("hidden");
	modal.setAttribute("aria-hidden", "false");
	document.body.style.overflow = "hidden";
};

const closeModal = () => {
	if (!modal) {
		return;
	}

	modal.classList.add("hidden");
	modal.setAttribute("aria-hidden", "true");
	document.body.style.overflow = "";
};

const storedTheme = localStorage.getItem(storageKeys.theme) || "light";
applyTheme(storedTheme);

if (themeButton) {
	themeButton.addEventListener("click", () => {
		const nextTheme = document.body.classList.contains("theme-dark") ? "light" : "dark";
		applyTheme(nextTheme);
		localStorage.setItem(storageKeys.theme, nextTheme);
	});
}

if (menuButton && nav) {
	menuButton.addEventListener("click", () => {
		const isOpen = nav.classList.toggle("open");
		menuButton.setAttribute("aria-expanded", String(isOpen));
	});
}

if (collectionTabs.length > 0 && collectionSections.length > 0) {
	const parseCollectionFromHash = () => {
		const hash = window.location.hash.replace("#", "").trim();
		if (!hash.startsWith("collection=")) {
			return null;
		}

		const value = hash.split("=")[1] || "";
		return value;
	};

	const isValidCollection = (value) =>
		Array.from(collectionTabs).some((tab) => tab.dataset.target === value);

	const setCollection = (target) => {
		collectionTabs.forEach((tab) => {
			const isActive = tab.dataset.target === target;
			tab.classList.toggle("active", isActive);
			tab.setAttribute("aria-selected", String(isActive));
		});

		collectionSections.forEach((section) => {
			const matches = target === "all" || section.dataset.collection === target;
			section.hidden = !matches;
		});

		localStorage.setItem(storageKeys.collection, target);
		history.replaceState(null, "", `#collection=${target}`);
	};

	collectionTabs.forEach((tab) => {
		tab.addEventListener("click", () => {
			setCollection(tab.dataset.target || "all");
		});
	});

	window.addEventListener("hashchange", () => {
		const hashCollection = parseCollectionFromHash();
		if (hashCollection && isValidCollection(hashCollection)) {
			setCollection(hashCollection);
		}
	});

	const hashCollection = parseCollectionFromHash();
	const savedCollection = localStorage.getItem(storageKeys.collection) || "all";
	if (hashCollection && isValidCollection(hashCollection)) {
		setCollection(hashCollection);
	} else if (isValidCollection(savedCollection)) {
		setCollection(savedCollection);
	} else {
		setCollection("all");
	}
}

let toastTimer = null;

const showToast = (message) => {
	let toast = document.querySelector(".toast");
	if (!toast) {
		toast = document.createElement("div");
		toast.className = "toast";
		toast.setAttribute("role", "status");
		toast.setAttribute("aria-live", "polite");
		document.body.appendChild(toast);
	}

	toast.textContent = message;
	toast.classList.remove("hide");

	clearTimeout(toastTimer);
	toastTimer = setTimeout(() => {
		toast.classList.add("hide");
	}, 2200);
};

addButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const product = button.closest(".product");
		if (!product) {
			return;
		}

		const name = product.dataset.name || "Item";
		const price = Number(product.dataset.price || "0");
		cart.push({ name, price });
		saveCart();
		renderCart();
		showToast(`${name} added to cart`);
	});
});

detailButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const product = button.closest(".product");
		if (product) {
			openModal(product);
		}
	});
});

modalCloseButtons.forEach((button) => {
	button.addEventListener("click", closeModal);
});

document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") {
		closeModal();
	}
});

if (checkoutButton) {
	checkoutButton.addEventListener("click", () => {
		if (cart.length === 0) {
			checkoutButton.textContent = "Cart is Empty";
			setTimeout(() => {
				checkoutButton.textContent = "Checkout";
			}, 1200);
			return;
		}

		checkoutButton.textContent = "Redirecting...";
		window.location.href = STRIPE_PAYMENT_LINK;
	});
}

renderCart();

const revealElements = document.querySelectorAll(".reveal");

const observer = new IntersectionObserver(
	(entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add("visible");
				observer.unobserve(entry.target);
			}
		});
	},
	{
		threshold: 0.18,
		rootMargin: "0px 0px -20px 0px",
	}
);

revealElements.forEach((element, index) => {
	element.style.transitionDelay = `${index * 70}ms`;
	observer.observe(element);
});
