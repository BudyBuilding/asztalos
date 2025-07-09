export const handleSelectClient = async (clientId) => {
    setLoading(true);
    try {
      dispatch(selectClient(clientId));
      navigate(`/clientAnalyzer/${clientId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting client:", error);
      setLoading(false);
    }
  };

export  const handleSelectWork = async (workId) => {
    setLoading(true);
    try {
      dispatch(selectWork(workId));
      fetchTables(workId);
      fetchObjectsForWork(workId);
      fetchCreatedItemsForWork(workId);
      const clientId = dispatch(getWorkById(workId)).client.clientId;
      dispatch(selectClient(clientId));
      navigate(`/workAnalyzer/${workId}`);
      setLoading(false);
    } catch (error) {
      console.error("Error while selecting work:", error);
      setLoading(false);
    }
  };

  const sortWorks = (key) => {
    let direction = 1;
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 1) {
      direction = 2;
    }
    if (key === "Status") {
      direction = sortConfig.direction === 4 ? 1 : sortConfig.direction + 1;
    }
    setSortConfig({ key, direction });
    const sorted = sorting(works, { key, direction });
   // setWorks(sorted);
  };


export const handleClientUpdate = async (updatedClientData) => {
    await dispatch(
      clientApi.updateClientApi(clientIdToModify, updatedClientData)
    );
    setShowClientUpdateModal(false);
    rendering();
  };

export const calculateWorkStats = () => {
    const lastMonthWorks = works.filter(
      (work) =>
        new Date(work.orderDate) >=
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const pending = works.filter((work) => work.status === "Pending").length;
    const completed = works.filter(
      (work) => work.status === "Completed"
    ).length;
    const measured = works.filter((work) => work.status === "Measured").length;
    const cancelled = works.filter(
      (work) => work.status === "Cancelled"
    ).length;
    const active = works.filter((work) => work.status === "Active").length;

    /*
    const pending = 8;
    const measured = 18;*/
    return { pending, measured, completed, cancelled, active };
  };

  const calculatePaymentStats = () => {
    const totalPaid = works.reduce((sum, work) => sum + work.paid, 0);
    const totalPrice = works.reduce((sum, work) => sum + work.price, 0);

    return { totalPaid, totalDue: totalPrice - totalPaid };
  };

  const workStats = calculateWorkStats();
  const paymentStats = calculatePaymentStats();

  useEffect(() => {
    setClients(loadClients());
   // setWorks(loadWorks());
  }, [render]);

  useEffect(() => {
    if (workStatusChartRef.current) {
      const chartInstance = new Chart(workStatusChartRef.current, {
        type: "pie",
        data: {
          labels: ["Pending", "Measured", "Completed", "Cancelled", "Active"],
          datasets: [
            {
              data: [
                workStats.pending,
                workStats.measured,
                workStats.completed,
                workStats.cancelled,
                works.active,
              ],
              backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCD56",
                "#FF8A65",
                "#4BC0C0",
              ],
            },
          ],
        },
      });

      // Clean up chart when component unmounts
      return () => {
        chartInstance.destroy();
      };
    }
  }, [workStats, works]);

  useEffect(() => {
    if (paymentStatusChartRef.current) {
      const chartInstance = new Chart(paymentStatusChartRef.current, {
        type: "pie",
        data: {
          labels: ["Paid", "Due"],
          datasets: [
            {
              data: [paymentStats.totalPaid, paymentStats.totalDue],
              backgroundColor: ["#4CAF50", "#FF9800"],
            },
          ],
        },
      });
      // Clean up chart when component unmounts
      return () => {
        chartInstance.destroy();
      };
    }
  }, [paymentStats]);


