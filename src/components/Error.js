const Error = (props) => {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            height: '97vh'
        }}>
            <h2>404 Error</h2>
            <p>Oops ! It seems you are expecting something which is not intended to be here.</p>
        </div>
    )
}

export default Error;
