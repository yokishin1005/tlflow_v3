import Layout from '../common/components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <h1>従業員管理システム</h1>
      <nav>
        <ul>
          <li>
          <Link href="/register">
            新規従業員登録
          </Link>
          </li>
        </ul>
      </nav>
    </Layout>
  );
}