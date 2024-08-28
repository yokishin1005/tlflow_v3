import React from 'react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheck, FiX } from 'react-icons/fi';

const FileUpload = ({ label, fileType, onDrop, fileStatus, acceptedFileTypes }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (files) => handleDrop(files, fileType),
    accept: acceptedFileTypes[fileType],
    maxFiles: 1
  });

  const handleDrop = (files, fileType) => {
    if (files.length === 0) {
      console.error('無効なファイルがアップロードされました');
      return;
    }

    const file = files[0];
    const validFileTypes = acceptedFileTypes[fileType];

    if (!validFileTypes.includes(file.type)) {
      console.error(`無効なファイルタイプが選択されました: ${file.type}`);
      return;
    }

    onDrop(files, fileType);
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div
        {...getRootProps()}
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-gray-400 transition duration-150 ease-in-out ${
          fileStatus.status === '完了' ? 'bg-green-50' : fileStatus.status === 'エラー' ? 'bg-red-50' : ''
        }`}
      >
        <div className="space-y-1 text-center">
          {fileStatus.status === '未アップロード' && <FiUpload className="mx-auto h-12 w-12 text-gray-400" />}
          {fileStatus.status === '完了' && <FiCheck className="mx-auto h-12 w-12 text-green-500" />}
          {fileStatus.status === 'エラー' && <FiX className="mx-auto h-12 w-12 text-red-500" />}
          <div className="flex text-sm text-gray-600">
            <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
              <span>{fileStatus.status === '未アップロード' ? 'ファイルを選択' : 'ファイルを変更'}</span>
              <input {...getInputProps()} className="sr-only" />
            </label>
            <p className="pl-1">またはドラッグ＆ドロップ</p>
          </div>
          <p className="text-xs text-gray-500">
            {fileType === 'picture' ? 'PNG, JPG, GIF up to 10MB' : 'PDF, DOC, DOCX, TXT up to 10MB'}
          </p>
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-500">ステータス: {fileStatus.status}</p>
      {fileStatus.data && (
        <div className="mt-2 p-2 bg-gray-100 rounded-md">
          <h4 className="text-sm font-medium text-gray-700">ファイル内容:</h4>
          <pre className="text-xs text-gray-600 whitespace-pre-wrap">{JSON.stringify(fileStatus.data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
