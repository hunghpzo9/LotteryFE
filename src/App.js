import "./App.css";
import {
  Breadcrumb,
  Layout,
  Spin,
  Button,
  Row,
  Modal,
  notification,
  Form,
} from "antd";
import "antd/dist/antd.css"; // or 'antd/dist/antd.less'
import React, { useEffect, useState } from "react";
import web3 from "./web3";
import lottery from "./lottery";
import { LoadingOutlined } from "@ant-design/icons";
const { Header, Content, Footer } = Layout;
const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

function App() {
  // console.log(web3.version)
  // web3.eth.getAccounts().then(console.log)

  const [manager, setManager] = useState("");
  const [result, setResult] = useState("0");
  const [winner, setWinner] = useState([]);
  const [players, setPlayers] = useState([]);
  const [balance, setBalance] = useState(""); // Note: balance is not a number - it's an object (wrapped in a library called BignumberJS)
  const [value, setValue] = useState(0);
  const [valueRandNum, setValueRandNum] = useState(0);
  const [msgLoading, setMsgLoading] = useState("");
  const [currentUser, setCurrentUser] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSentRequest, setIsSentRequest] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState([]);
  const [previousWinner, setPreviousWinner] = useState([]);
  const [previousRoundBalance, setPreviousRoundBalance] = useState("");


  useEffect(() => {

    const getManager = async () => {

      // Don't need to set from argument because we're using the Metamask provider

      await web3.eth.getAccounts().then((value) => {
        setCurrentUser(value);
      });
      await web3.eth.getAccounts();
      console.log("useEffect");
      const result = await lottery.methods.result().call();
      const manager = await lottery.methods.manager().call();

      try {
        const currentPlayer = await lottery.methods.getAllCurrentPlayer().call();
        setCurrentPlayer(currentPlayer);
      } catch (error) {
        console.error('Error fetching data:', error);
      }

      try {
        const previousWinner = await lottery.methods.getAllPreviousWinner().call();
        setPreviousWinner(previousWinner);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      // const balance = await web3.eth.getBalance(lottery.options.address);
      const balance= await lottery.methods.roundBalance().call();
      const previousRoundBalance= await lottery.methods.previousRoundBalance().call();

      setResult(result);
      setManager(manager);
      setBalance(balance);
      setPreviousRoundBalance(previousRoundBalance)

    };

    getManager();
  }, [manager, players, balance]);

  const onSubmit = async (event) => {
    // event.preventDefault()
    setIsLoading(true);
    setMsgLoading("Waiting on transaction success...");

    // Need to define from argument when using send method
    const accounts = await web3.eth.getAccounts();

    try {
      // const transaction = await contract.pickNumber(number, { value: ethers.utils.parseEther('0.01') });
      await lottery.methods.pickNumber(valueRandNum).send({
        from: accounts[0],
        value: web3.utils.toWei(value, "wei"),
      });
      setIsLoading(false);
      notification.open({
        message: "Notification",
        description: "Pay successfully!",
        className: "custom-class",
        style: {
          width: 400,
        },
      });
      // setMessage('You have been entered!');
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: "Notification",
        description: "Something went wrong",
        className: "custom-class",
        style: {
          width: 400,
        },
      });
    }
  };

  const onClick = async () => {
    const accounts = await web3.eth.getAccounts();

    setIsLoading(true);
    setMsgLoading("Picking a random number...");

    try {
      await lottery.methods.requestRandomWords().send({
        from: accounts[0],
      });
      setIsSentRequest(true);
      setIsLoading(false);
      notification.open({
        message: "Notification",
        description: "A number has been picked!",
        className: "custom-class",
        style: {
          width: 400,
        },
      });
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: "Notification",
        description: "Something went wrong",
        className: "custom-class",
        style: {
          width: 400,
        },
      });
    }
  };

  const onClickTransfer = async () => {
    const accounts = await web3.eth.getAccounts();

    setIsLoading(true);
    setMsgLoading("Transer award to winner...");

    try {
      await lottery.methods.pickWinner().send({
        from: accounts[0],
      });
      try {
        const winner = await lottery.methods.getAllPreviousWinner().call();
        setWinner(winner);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setIsLoading(false);
      setIsModalOpen(true);
      // notification.open({
      //   message: 'Notification',
      //   description: 'Transfered award to winner!',
      //   className: 'custom-class',
      //   style: {
      //     width: 400,
      //   },
      // });
    } catch (error) {
      setIsLoading(false);
      notification.open({
        message: "Notification",
        description: "Something went wrong",
        className: "custom-class",
        style: {
          width: 400,
        },
      });
    }
  };

  const bigSize = {
    fontSize: "50px",
  };

  const dad = {
    display: "flex",
    justifyContent: "space-between",
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <Spin tip={msgLoading} indicator={antIcon} spinning={isLoading}>
      <Modal
        title="Congratulation"
        open={isModalOpen}
        onOk={handleOk}
        footer={[
          <Button key="back" onClick={handleCancel}>
            OK
          </Button>,
        ]}
      >
         {winner.length === 0 ? (
                <p>No current player now.</p>
              ) : (
                <ul>
                  {winner.map((address, index) => (
                    <li key={index}>{address}</li>
                  ))}
                </ul>
              )}
      </Modal>
      <Layout className="layout">
        <Header>
          <div className="header-text">Hi {currentUser}</div>
        </Header>
        <Content
          style={{
            padding: "0 50px",
          }}
        >
          <Breadcrumb
            style={{
              margin: "16px 0",
            }}
          >
            <Breadcrumb.Item>
              <h2>Lottery-2024-Blockchain-Do Ba Lam</h2>
            </Breadcrumb.Item>
            {/* <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item> */}
          </Breadcrumb>

          <div className="site-layout-content">
            <div>
              <Row style={dad}>
                <div>
                  <p>This contract is managed by {manager}.</p>
                  {result !== "0" ? <p>Random number: {result}</p> : <></>}
                  {/* {winner !== '0x0000000000000000000000000000000000000000' ?
                    <p>Winner: {winner}</p> : <></>
                  }                 */}
                </div>
                <div>
                  <Row align="center">
                    <Button
                      size="large"
                      style={{ marginLeft: "5px" }}
                      disabled={manager === currentUser}
                      onClick={onClickTransfer}
                      type="primary"
                    >
                      Quay số
                    </Button>
                  </Row>
                </div>
              </Row>

              <Row align="center">
                <h1 style={bigSize}>
                  Total award: {web3.utils.fromWei(balance, "ether")} ETH
                </h1>
              </Row>

              <Row align="center">
                <Form onFinish={onSubmit}>
                  <div style={{ marginBottom: "10px" }}>
                    <label>Enter Wei: </label>
                    <input
                      value={value}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(/[^0-9]/g, ''); // Remove non-numeric characters
                        setValue(numericValue);
                      }}
                    />
                    {/* <InputNumber defaultValue={0} onChange={(e) => setValue(e)}/> */}
                    {/* <label style={{marginLeft : '5px'}}> = {value * 0.01} ETH </label> */}
                  </div>
                  <div>
                    <label>Enter Random number: </label>
                    <input
                      value={valueRandNum}
                      onChange={(e) => {
                        const inputValue = parseInt(e.target.value, 10);
                        // Check if the input is a number and within the range 0-100
                        if (inputValue >= 0 && inputValue <= 100) {
                          setValueRandNum(inputValue);
                        }
                      }}
                    />
                    {/* <InputNumber defaultValue={0} onChange={(e) => setValue(e)}/> */}
                    {/* <label style={{marginLeft : '5px'}}> = {value * 0.01} ETH </label> */}
                  </div>
                  <Button
                    style={{ marginTop: "10px", width: "200px" }}
                    type="primary"
                    htmlType="submit"
                  >
                    Đặt cược
                  </Button>
                </Form>
              </Row>

            </div>
            {/* <h1>{message}</h1> */}
          </div>
          <div style={{ display: 'flex' }}>
            {/* Column for player list */}
            <div style={{ flex: 1 }}>
              <h2>Previous Round</h2>
                <ul>
                {web3.utils.fromWei(previousRoundBalance, "ether")} ETH
                </ul>
              
            </div>
            <div style={{ flex: 1, marginRight: '20px' }}>
              <h2>Previous Winner</h2>
              {previousWinner.length === 0 ? (
                <p>No winners on previous round.</p>
              ) : (
                <ul>
                  {previousWinner.map((address, index) => (
                    <li key={index}>{address}</li>
                  ))}
                </ul>
              )}
            </div>

            {/* Column for current player */}
            <div style={{ flex: 1 }}>
              <h2>Current Player</h2>
              {currentPlayer.length === 0 ? (
                <p>No current player now.</p>
              ) : (
                <ul>
                  {currentPlayer.map((address, index) => (
                    <li key={index}>{address}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </Content>
        <Footer
          style={{
            textAlign: "center",
          }}
        ></Footer>
      </Layout>
    </Spin>
  );
}
export default App;
