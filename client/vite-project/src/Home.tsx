import { useEffect, useState } from 'react'
import './App.css'
import axios from  'axios';

const Spinner = () => (
    <div className="grid min-h-[140px] w-full place-items-center overflow-x-scroll rounded-lg p-6 lg:overflow-visible">
  <svg class="w-12 h-12 text-gray-300 animate-spin" viewBox="0 0 64 64" fill="none"
      xmlns="http://www.w3.org/2000/svg" width="24" height="24">
      <path
        d="M32 3C35.8083 3 39.5794 3.75011 43.0978 5.20749C46.6163 6.66488 49.8132 8.80101 52.5061 11.4939C55.199 14.1868 57.3351 17.3837 58.7925 20.9022C60.2499 24.4206 61 28.1917 61 32C61 35.8083 60.2499 39.5794 58.7925 43.0978C57.3351 46.6163 55.199 49.8132 52.5061 52.5061C49.8132 55.199 46.6163 57.3351 43.0978 58.7925C39.5794 60.2499 35.8083 61 32 61C28.1917 61 24.4206 60.2499 20.9022 58.7925C17.3837 57.3351 14.1868 55.199 11.4939 52.5061C8.801 49.8132 6.66487 46.6163 5.20749 43.0978C3.7501 39.5794 3 35.8083 3 32C3 28.1917 3.75011 24.4206 5.2075 20.9022C6.66489 17.3837 8.80101 14.1868 11.4939 11.4939C14.1868 8.80099 17.3838 6.66487 20.9022 5.20749C24.4206 3.7501 28.1917 3 32 3L32 3Z"
        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"></path>
      <path
        d="M32 3C36.5778 3 41.0906 4.08374 45.1692 6.16256C49.2477 8.24138 52.7762 11.2562 55.466 14.9605C58.1558 18.6647 59.9304 22.9531 60.6448 27.4748C61.3591 31.9965 60.9928 36.6232 59.5759 40.9762"
        stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" class="text-gray-900">
      </path>
    </svg>
</div>
)

function Home() {
  const [url, setUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [urls, setUrls] = useState([]);
  const [refresh, setRefresh] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!url) return;
    try {
      const response = await axios.post("http://localhost:3000/shorten", { url });
      console.log(response);
      setShortUrl(response.data.shortUrl);
    }catch(err) {
      console.log("Something went wrong");
      console.log("err");
    }
  }

  const getAllUrls = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("http://localhost:3000/get-all-urls");
      console.log(response);
      setUrls(response.data);
    }catch(err) {
      console.log("Something went wrong");
      console.log("err");
    }finally{
        setIsLoading(false);
    }
  }

  useEffect(() => {
    getAllUrls();
  }, [refresh])

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100 flex-col'>
      <div className='p-6 max-w-sm bg-white rounded-lg shadow-md'>
        <h1 className='text-2xl font-bold mb-4'>URL Shorty</h1>
        <form onSubmit={handleSubmit}>
          <input 
            type='text'
            placeholder='Enter your URL here'
            className='w-full p-2 border border-gray-300 rounded-md mb-4'
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
          <button
            type='submit'
            className='w-full bg-blue-500 text-white py-2 rounded-md'
          >
            ShortenURL
          </button>
        </form>

        {shortUrl && (
          <p className='text-center text-sm text-gray-500 mt-4'>
            Your shortened url is <a className="text-sky-500" target="_blank" href={shortUrl}>{shortUrl}</a>
          </p>
        )}
      </div>
      <div className='p-6 mt-6 max-h-sm overflow-y w-[1000px] bg-white rounded-lg shadow-md'>
        <div className='grid grid-cols-12 gap-2'>
            <div className='font-bold col-span-5'>Shorten URL</div>
            <div className='font-bold col-span-5'>Original URL</div>
            <div className='col-span-2 cursor-pointer' onClick={() => setRefresh(!refresh)}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
</svg>
            </div>
            {isLoading ? <div className='col-start-6 '>
                <Spinner /> 
            </div> :
                urls.map((url, index) => (
                    <>
                        <div key={index} className='col-span-5 break-all'>{url.shortenUrl}</div>
                        <div key={index} className='col-span-5 break-all'>{url.originalUrl}</div>
                    </>
                ))
            }
            
        </div>
      </div>
    </div>
  )
}

export default Home;
