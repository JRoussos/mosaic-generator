import React, { useRef, useState } from 'react'
import './file_upload_styles.css'

const DEFAULT_MAX_FILE_SIZE_IN_BYTES = 2000000;

const FileUpload = ({label, updateFile, ...props}) => {
    const [error, setError] = useState(false)
    const fileInputRef = useRef()

    const addNewFiles = (fileList) => {
        const file = fileList[0]
        let isImageFile = file.type.split("/")[0] === "image";
        if (file.size <= DEFAULT_MAX_FILE_SIZE_IN_BYTES && isImageFile) {
            setError(false)
            updateFile(URL.createObjectURL(file))
        }else{
            setError(true)
            console.log("File is too big ")
        }
    }

    const handleOnFileChange = (event) => {
        const { files: newFiles } = event.target
        if (newFiles.length > 0) addNewFiles(newFiles)
    }

    return (
        <React.Fragment>
            <input type='file' ref={fileInputRef} onChange={handleOnFileChange} title='' value='' {...props}/>
            {error && <p className='error'>You should upload an image with a max size of 2 MB, try a smaller image or use the demo one</p>}
        </React.Fragment>
    )
}

export default FileUpload