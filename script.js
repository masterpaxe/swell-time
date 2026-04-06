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
const lookbookModal = document.querySelector("#lookbookModal");
const lookModalTitle = document.querySelector("#lookModalTitle");
const lookModalDescription = document.querySelector("#lookModalDescription");
const lookModalItems = document.querySelector("#lookModalItems");
const lookModalTotal = document.querySelector("#lookModalTotal");
const addLookToCartButton = document.querySelector("#addLookToCart");
const closeLookButtons = document.querySelectorAll("[data-close-look]");
const contactForm = document.querySelector("#contactForm");
const contactStatus = document.querySelector("#contactStatus");
const collectionTabs = document.querySelectorAll(".collection-tab");
const collectionSections = document.querySelectorAll(".collection-section");
const shopLookButtons = document.querySelectorAll(".shop-look");

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

const lookbookBundles = {
	"city-evening": [
		{ name: "Silk Drift Dress", price: 138, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&q=80" },
		{ name: "Contour Blazer", price: 156, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=80&q=80" },
	],
	"weekend-linen": [
		{ name: "Crescent Wrap Top", price: 82, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=80&q=80" },
		{ name: "Harbor Denim Skirt", price: 74, image: "https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=80&q=80" },
	],
	"travel-uniform": [
		{ name: "Studio Wide-Leg Trousers", price: 148, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=80&q=80" },
		{ name: "Cloud Rib Tank", price: 96, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=80&q=80" },
		{ name: "Aria Cropped Jacket", price: 112, image: "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=80&q=80" },
	],
};

const lookbookMeta = {
	"city-evening": {
		title: "City Evening",
		description: "Contour Blazer layered over the Silk Drift Dress for gallery nights and dinner plans.",
	},
	"weekend-linen": {
		title: "Weekend Linen",
		description: "Crescent Wrap Top with Harbor Denim Skirt creates a crisp, easy weekend silhouette.",
	},
	"travel-uniform": {
		title: "Travel Uniform",
		description: "Studio Wide-Leg Trousers styled with Cloud Rib Tank and Aria Cropped Jacket.",
	},
};

let activeLookKey = null;

const closeLookModal = () => {
	if (!lookbookModal) {
		return;
	}
	lookbookModal.classList.add("hidden");
	lookbookModal.setAttribute("aria-hidden", "true");
	document.body.style.overflow = "";
	activeLookKey = null;
};

const openLookModal = (lookKey) => {
	if (!lookbookModal || !lookModalTitle || !lookModalDescription || !lookModalItems || !lookModalTotal) {
		return;
	}

	const bundle = lookbookBundles[lookKey] || [];
	const meta = lookbookMeta[lookKey];
	if (!meta || bundle.length === 0) {
		return;
	}

	activeLookKey = lookKey;
	lookModalTitle.textContent = meta.title;
	lookModalDescription.textContent = meta.description;
	lookModalItems.innerHTML = bundle
		.map((item) => `<li>
			<img src="${item.image}" alt="${item.name}" class="look-item-thumb" loading="lazy">
			<span>${item.name}</span>
			<strong>${formatCurrency(item.price)}</strong>
		</li>`)
		.join("");

	const total = bundle.reduce((sum, item) => sum + item.price, 0);
	lookModalTotal.textContent = `Look Total: ${formatCurrency(total)}`;

	lookbookModal.classList.remove("hidden");
	lookbookModal.setAttribute("aria-hidden", "false");
	document.body.style.overflow = "hidden";
};

shopLookButtons.forEach((button) => {
	button.addEventListener("click", () => {
		const lookKey = button.dataset.look || "";
		openLookModal(lookKey);
	});
});

if (addLookToCartButton) {
	addLookToCartButton.addEventListener("click", () => {
		if (!activeLookKey) {
			return;
		}

		const bundle = lookbookBundles[activeLookKey] || [];
		if (bundle.length === 0) {
			return;
		}

		bundle.forEach((item) => cart.push(item));
		saveCart();
		renderCart();
		showToast(`Added ${bundle.length} items from lookbook`);
		closeLookModal();
	});
}

closeLookButtons.forEach((button) => {
	button.addEventListener("click", closeLookModal);
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
		closeLookModal();
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

if (contactForm && contactStatus) {
	contactForm.addEventListener("submit", (event) => {
		event.preventDefault();

		const formData = new FormData(contactForm);
		const name = String(formData.get("name") || "").trim();
		const email = String(formData.get("email") || "").trim();
		const message = String(formData.get("message") || "").trim();

		if (!name || !email || !message) {
			contactStatus.textContent = "Please fill all fields before submitting.";
			contactStatus.classList.remove("success");
			contactStatus.classList.add("error");
			return;
		}

		contactStatus.textContent = "Message sent. Our team will get back to you shortly.";
		contactStatus.classList.remove("error");
		contactStatus.classList.add("success");
		contactForm.reset();
	});
}
