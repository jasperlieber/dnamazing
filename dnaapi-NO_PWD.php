
<?php header("Access-Control-Allow-Origin: *");

class dna {
    
    private $db;
    
    function __construct() {
        
//         error_log('DNAmazing!<br><br>');
        
        $this->db = mysqli_connect("localhost","root","XXXXXX","mysql");
        
        // Check connection
        if (mysqli_connect_errno()) {
            error_log("Failed to connect to MySQL: " . mysqli_connect_error());
        } else {
//             echo "connected<br>";
        }
        
//         $query = 'select * from dna_user';
        
//         $result = mysqli_query($this->db, $query);
        
//         while($row = $result->fetch_assoc())
//         {
//             print_r($row);
//             echo "<br />";
//         }
    }
    
    public function go() {
        
        if(isset($_GET["newuser"])) $this->newUser();
        if(isset($_GET["getuser"])) $this->getUser();
        if(isset($_POST["setuser"])) $this->setUser();
        if(isset($_GET["getallusers"])) $this->getAllUsers();
        if(isset($_GET["refreshMe"])) $this->refreshMe();
    }
    
    public function newUser() {
        
        if(!isset($_GET["numColors"])) return;
        
        $query = "INSERT INTO dna_user () VALUES ();";
        $res = mysqli_query($this->db, $query);
        
        if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
        else {
            
            $id = $this->db->insert_id;
            $color = $id % $_GET["numColors"];
            $genome = '{"cc":' . $color . '}';
            
            $query = "
                UPDATE dna_user SET genome = '$genome'
                WHERE id = " . $id;
            
            $res = mysqli_query($this->db, $query);
            
            if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
            else echo '{"id":' . $id . ',"cc":' . $color .'}';
        }
    }
    
    public function setUser() {
        
        if(!isset($_POST["id"])) return;
        if(!isset($_POST["genome"])) return;
        
        $query = "
            UPDATE dna_user SET genome = '" . $_POST["genome"] . "'
            WHERE id = " . $_POST["id"];
        
        $res = mysqli_query($this->db, $query);
        
        if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
        else echo '{"success":"oh_yeah"}';
    }
    
    
    public function refreshMe() {
        
        if(!isset($_GET["id"])) return;
        
        $id = $_GET["id"];
        $color = $id % $_GET["numColors"];
        $genome = '{"cc":' . $color . '}';
        
        $query = "
                UPDATE dna_user SET genome = '$genome'
                WHERE id = " . $id;
        
        $res = mysqli_query($this->db, $query);
        
        if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
        else echo '{"success":"oh_yeah"}';
    }
    
    public function getUser() {
        
        if(!isset($_GET["id"])) return;
        
        $query = "
            SELECT genome FROM dna_user
            WHERE id = " . $_GET["id"];
        
        $res = mysqli_query($this->db, $query);
        
        if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
        else  {
            $row = $res->fetch_assoc();
            echo '{"genome":' . $row['genome'] . '}';
        }
    }
    public function getAllUsers() {
        
        $query = "(SELECT id, genome FROM dna_user ORDER BY id DESC LIMIT 8) 
            UNION (SELECT id, genome FROM dna_user WHERE ID < 7 ORDER BY id)";
        
        $res = mysqli_query($this->db, $query);
        
        $ret = array();
        
        if (!$res) error_log("Error: " . $query . " - " . mysqli_error($this->db));
        else  {
            while ($row = $res->fetch_assoc())
                $ret[] = $row;
                echo '{"allUsers":' . json_encode($ret) . '}';
        }
    }
}

$dna = new dna();
$dna->go();
?>
