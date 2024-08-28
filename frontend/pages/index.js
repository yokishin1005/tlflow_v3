import Layout from '../common/components/Layout';
import Link from 'next/link';
import Image from 'next/image';
import { ClipboardList } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="flex items-center justify-center h-screen px-8">
        <div className="flex flex-col items-center justify-center mr-8">
          <Image src="/images/TF_logo.png" alt="TalentFlow Logo" width={400} height={300} />
          <h2 className="text-2xl font-semibold mt-4">AIによる最適な人事配置を実現</h2>
          <h1 className="text-4xl font-bold text-gray-800 mt-2">Talent Flow</h1>
        </div>
        <div className="flex flex-col items-center ml-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">従業員管理システム</h1>
          <Link href="/register">
            <a className="flex items-center px-6 py-3 bg-yellow-400 text-white text-lg font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition">
              <ClipboardList className="w-6 h-6 mr-2" />
              新規従業員登録
            </a>
          </Link>
        </div>
      </div>
    </Layout>
  );
}
