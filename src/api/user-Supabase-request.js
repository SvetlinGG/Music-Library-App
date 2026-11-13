

const userApiKey = 'sb_publishable_1YnOAlXkaINLpwxGrT8QNg_-ssIpzlT';
const userSupabaseUrl = 'https://pntezrlzpnvbmxjltaqr.supabase.co/rest/v1/profiles';

export default async function request(path = '/', method = 'GET', data = null){

    const options = {
        headers: {
            'apiKey': userApiKey,
            'Authorization': `Bearer ${userApiKey}`
        }
    };
    if (method !== 'GET'){
        options.method = method
        options.headers['Prefer'] = 'return=minimal'
    }
    if (data){
        options.headers["Content-Type"] = "application/json"
        options.body = JSON.stringify(data)
    }

    const response = await fetch(`${userSupabaseUrl}${path}`, options);

    if (!response.ok){
        throw new Error(`Error: ${response.status}`);
    }

    if ([201, 204].includes(response.status)){
        return null;
    }

    return response.json();

}