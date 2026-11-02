// Wraps each word in a span so CSS can animate the words in one after another; the text stays in the HTML for SEO.
export default function SplitWords({ text, start = 0 }) {
  return text.split(" ").map((word, i) => (
    <span key={i} className="word" style={{ "--i": start + i }}>
      {word}{" "}
    </span>
  ));
}
