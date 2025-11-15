// extension/gestures/scroll.js

export function handleScroll(data) {
    const amount = data.amount || 0;

    // Medium smooth scroll effect using window.scrollBy
    window.scrollBy({
        top: amount,
        left: 0,
        behavior: "smooth"
    });
}
