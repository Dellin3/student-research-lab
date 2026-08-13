export default function PageIntro({ eyebrow, title, description, children }) {
  return (
    <header className="page-intro">
      <div className="narrow">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="lead">{description}</p>
        {children}
      </div>
    </header>
  )
}
