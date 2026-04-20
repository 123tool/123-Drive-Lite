let currentPath = '';

async function fetchFiles() {
    const res = await fetch(`/api/files?path=${encodeURIComponent(currentPath)}`);
    const files = await res.json();
    const list = document.getElementById('fileList');
    const pathDisplay = document.getElementById('currentPath');
    
    pathDisplay.innerText = '/sdcard/' + currentPath;
    list.innerHTML = '';

    // Tombol Kembali (Back)
    if (currentPath !== '') {
        const tr = document.createElement('tr');
        tr.className = "border-b-2 border-black hover:bg-gray-100 cursor-pointer";
        tr.innerHTML = `
            <td class="p-3 font-black" onclick="goBack()"> [ .. ] KEMBALI </td>
            <td class="p-3 text-right"></td>
        `;
        list.appendChild(tr);
    }

    files.forEach(file => {
        const tr = document.createElement('tr');
        tr.className = "border-b-2 border-black hover:bg-gray-100";
        
        const nameContent = file.isFolder 
            ? `<span class="cursor-pointer text-blue-600" onclick="enterFolder('${file.name}')">📁 ${file.name}</span>` 
            : `📄 ${file.name}`;

        tr.innerHTML = `
            <td class="p-3">${nameContent}</td>
            <td class="p-3 text-right">
                ${!file.isFolder ? `<button onclick="downloadFile('${file.name}')" class="neo-btn bg-green-400 px-2 py-1 text-xs mx-1">GET</button>` : ''}
                <button onclick="deleteFile('${file.name}')" class="neo-btn bg-red-500 text-white px-2 py-1 text-xs mx-1">DEL</button>
            </td>
        `;
        list.appendChild(tr);
    });
}

function enterFolder(name) {
    currentPath += (currentPath === '' ? '' : '/') + name;
    fetchFiles();
}

function goBack() {
    const parts = currentPath.split('/');
    parts.pop();
    currentPath = parts.join('/');
    fetchFiles();
}

async function downloadFile(name) {
    const path = currentPath === '' ? name : `${currentPath}/${name}`;
    window.open(`/api/download?path=${encodeURIComponent(path)}`, '_blank');
}

async function deleteFile(name) {
    if (!confirm('Yakin mau hapus, Bos?')) return;
    const path = currentPath === '' ? name : `${currentPath}/${name}`;
    await fetch(`/api/delete?path=${encodeURIComponent(path)}`, { method: 'DELETE' });
    fetchFiles();
}

async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput.files.length === 0) return alert('Pilih file dulu!');

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const res = await fetch(`/api/upload?path=${encodeURIComponent(currentPath)}`, {
        method: 'POST',
        body: formData
    });

    if (res.ok) {
        alert('Upload Berhasil!');
        fileInput.value = '';
        fetchFiles();
    } else {
        alert('Gagal Upload!');
    }
}

// Load pertama kali
fetchFiles();
