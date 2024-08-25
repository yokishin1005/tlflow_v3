import Link from 'next/link';

export default function Layout({ children }) {
  return (
    <div>
      <header>
        <nav>
          <Link href="/">
            <a>ホーム</a>
          </Link>
          {' | '}
          <Link href="/employees">
            <a>従業員一覧</a>
          </Link>
          {' | '}
          <Link href="/register">
            <a>新規登録</a>
          </Link>
        </nav>
      </header>
      <main>{children}</main>
      <footer>
        <p>© 2024 従業員管理システム</p>
      </footer>
    </div>
  );
}