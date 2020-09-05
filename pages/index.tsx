import { Technical } from '../components/technical'
import { PropsWithChildren } from 'react'

export default function Index() {
  return (
    <>
      <style jsx>{`
        .hidden {
          display: none;
        }
        a,
        a:visited,
        a:active {
          color: blue;
        }
        .img {
          width: 100%;
          max-width: 694px;
        }
        .img img {
          width: 100%;
          border-radius: 50%;
        }
        button {
          height: 40px;
          padding: 0 15px;
          font-size: 20px;
          display: flex;
          justify-content: center;
          align-items: center;
          background: white;
          border: 2px solid black;
          border-radius: 20px;
        }
        button:hover {
          text-decoration: underline;
        }
        html,
        body {
          background: white;
          margin: 0;
          color: black;
          font-size: 18px;
        }
        body {
          padding: 10px;
        }
        h1 {
          font-size: calc(18px + 4vw);
          margin: 20px 0;
        }
      `}</style>
      <h1>Bc. Isabella Skořepová</h1>
      <div className="img">
        <img src="/static/avatar.jpg" />
      </div>
      <p>
        Člověk by řekl, že když dělám webovky už několik let, že budu mít hezčí
        stránky...
        <br />
        Ale co naplat. Kovářova kobyla chodí bosa 😆
        <br />A ano, jsem Bc neboť jsem dala státnice. Na Ing se pracuje 😹
      </p>
      <ul>
        <li>
          <Link href="https://isbl.cz/zpevnik">Zpěvník (funguje offline)</Link>
        </li>
        <li>
          <Link href="https://isbl.cz/mantinely">mantinelydemokracie.cz</Link>{' '}
          (archiv)
        </li>
        <li>
          Reflektor{' '}
          <Link href="https://isbl.cz/reflektor-android">Google Play</Link>{' '}
          <Link href="https://isbl.cz/reflektor-ios">App Store</Link>
        </li>
        <li>
          <Link href="https://ok1kvk.cz/">ok1kvk.cz</Link>
        </li>
        <li>
          <Link href="https://rekonstrukcestatu.cz/">
            Rekonstrukce státu.cz
          </Link>
        </li>
        <li>
          Profil na <Link href="https://isbl.cz/gitlab">GitLab.com</Link> a{' '}
          <Link href="https://isbl.cz/github">GitHub</Link>
        </li>
        <li>A další neveřejné projekty</li>
      </ul>
      <Technical />
    </>
  )
}

function Link({ href, children }: PropsWithChildren<{ href: string }>) {
  return (
    <a href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  )
}
