<?php

namespace Phpcmf\Controllers;

use CodeIgniter\CLI\CLI;

//二十二

/**
 * www.xunruicms.com
 * 迅睿内容管理框架系统（简称：迅睿CMS）
 * 本文件是框架系统文件，二次开发时不可以修改本文件，可以通过继承类方法来重写此文件
 **/

class Service22 extends \Phpcmf\Common
{

    protected $sso_url;
    protected $base_url;


     public function __construct(...$params)
    {
        parent::__construct(...$params);
        // 设置跨域头
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');

        // 处理预检请求
        if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
            http_response_code(200);
            exit;
        }
        list($module, $data) = \Phpcmf\Service::M('Site')->domain();
        $site_domain = $data['site_domain'];
        $this->base_url = "http://" . $site_domain;
    }
    
    public function detectAddress(){
        $ip = \Phpcmf\Service::L('input')->ip_address();
        $address = \Phpcmf\Service::L('ip')->address($ip);
        
        return [
            'ip'=>$ip,
            'address'=>$address
        ];
    }
    
    public function detectChannel(){
        $code = dr_safe_filename(\Phpcmf\Service::L('input')->get('code'));
        $field = \Phpcmf\Service::M()->db->table('1_sharechannel')
            ->select('id,title ,thumb,keywords,code, author,zyhjnr,description')
            ->where('code', $code)
            ->get()->getrowarray();
        if($field){
            return $field;
        }else{
           return $this->_json(404, '该频道未注册', [
                'time' => time(),
                'data' => null
            ]);
        };
    }
    
    public function insertUser(){
        $ipMessage = $this->detectAddress();
        $channel = $this->detectChannel();
       
        
         $field = \Phpcmf\Service::M()->db->table('1_sharechannelmembers')
            ->where('channel_id', $channel['id'])
             ->where('ipaddress', $ipMessage['ip'])
            ->get()->getrowarray();
            
           
        if(!$field){
            $data = [
                'ipaddress'=>$ipMessage['ip'],
                'ipguishudi'=>$ipMessage['address'],
                'channel_id'=>$channel['id'],
                'fangwencishu'=>1,
                'updatetime'=>time()
                ];
            $field = \Phpcmf\Service::M()->db->table('1_sharechannelmembers')
            ->insert($data);
        }else{
            \Phpcmf\Service::M()->db->table('1_sharechannelmembers')
            ->where('id', $field['id'])
            ->update([
                'fangwencishu'=>$field['fangwencishu']+1,
                'updatetime'=>time()
            ]);
        }
        
        
    }

 
    
    //频道-资源s-剧集s

   //获取频道详情资料
    public function getChannelDetail()
    {
        $this->insertUser();
         $channel = $this->detectChannel();
    
            $channel['thumb'] = $channel['thumb'] ? $this->base_url . dr_thumb($channel['thumb']) : '';
            return $this->_json(200, '获取成功', [
                'time' => time(),
                'data' => $channel
            ]);
      
    }


  //获取频道所有资源列表
    public function getChannelResources()
    {
      $field  = $this->detectChannel();
        $field = array_map(function ($item) {
            if ($item['zyhjnr']) {
                // 先将HTML实体解码，然后将JSON字符串解码为对象
                $decoded_json_string = html_entity_decode($item['zyhjnr']);
                $item['items'] = count(json_decode($decoded_json_string));
                $item['zyhjnr'] = '';
            }
            if (is_numeric($item['thumb'])) {
                $item['thumb'] = $this->base_url . dr_thumb($item['thumb']);
            }
            return $item;
        }, $field);

        return $this->_json(200, '获取成功', [
            'time' => time(),
            'data' => $field
        ]);
    }

    /**
     * base64图片上传
     */
    public function upload_base64_image()
    {

        $content = trim($_POST['file']);
        
        if (preg_match('/^(data:\s*image\/(\w+);base64,)/i', $content, $result)) {
           
            $content = base64_decode(str_replace($result[1], '', $content));
            if (strlen($content) > 30000000) {
                $this->_json(0, dr_lang('图片太大了'));
            }
            
        }
        
        
        //p:cnandva989283ahkjhad
        //fid:14
        $p = [
            'size' => 5, // 最大文件大小，单位 MB
            'exts' => 'jpg,png,gif', // 允许的扩展名，用逗号分隔
            'attachment' => 1, // 存储策略 ID，例如 1 代表本地存储
            'image_reduce' => 1, // 是否进行图片缩放，1 为是，0 为否
            'chunk' => 10 * 1024 * 1024, // 分块上传大小，单位 Byte，例如 10MB
        ];
        
        $rt = \Phpcmf\Service::L('upload')->upload_file([
            'path' => '',
            'form_name' => 'file_data',
            'file_exts' => explode(',', strtolower(str_replace('，', ',', $p['exts']))),
            'file_size' => $p['size'] * 1024 * 1024,
            'attachment' => \Phpcmf\Service::M('Attachment')->get_attach_info((int)$p['attachment'], (int)$p['image_reduce']),
            'watermark' => isset($_GET['is_wm']) && $_GET['is_wm'] ? 1 : 0,
        ]);
        
        \Phpcmf\Service::C()->_json(30, $rt);

        // // 使用 dr_authcode 对参数数组进行编码，生成 p 参数
        // $p = dr_authcode($params, 'ENCODE');

        // $fid = (int)\Phpcmf\Service::L('input')->get('fid');
        // $field = \Phpcmf\Service::C()->get_cache('table-field', $fid);
        // if (!$field) {
        //     $p = dr_string2array(dr_authcode(\Phpcmf\Service::L('input')->get('p'), 'DECODE'));
        //     if (!$p) {
        //         \Phpcmf\Service::C()->_json(0, dr_lang('字段参数有误'));
        //     }
        //     // return $p;
        // }

        // $p =  [
        //     'size' => floatval($field['setting']['option']['size']),
        //     'exts' => $field['setting']['option']['ext'],
        //     'count' => max(1, (int)$field['setting']['option']['count']),
        //     'attachment' => $field['setting']['option']['attachment'],
        //     'image_reduce' => $field['setting']['option']['image_reduce'],
        //     'chunk' => $field['setting']['option']['chunk'] ? 20 * 1024 * 1024 : 0,
        // ];

        // 定义上传参数数组

        // exit(dr_array2string($p));/


        $content = $_POST['file'];
        
        
        if (preg_match('/^(data:\s*image\/(\w+);base64,)/i', $content, $result)) {
          
            $ext = strtolower($result[2]);
            if (!in_array($ext, ['png', 'jpg', 'jpeg', 'gif', 'webp'])) {
                \Phpcmf\Service::C()->_json(0, dr_lang('图片格式不正确'));
            }
            $content = base64_decode(str_replace($result[1], '', $content));
               \Phpcmf\Service::C()->_json(0, $content);
            if (strlen($content) > 30000000) {
                \Phpcmf\Service::C()->_json(0, dr_lang('图片太大了'));
            }
            
            $attachment = \Phpcmf\Service::M('Attachment')->get_attach_info((int)$p['attachment'], (int)$p['image_reduce']);
            
            $config = [
                'ext' => $ext,
                'content' => $content,
                'attachment' => $attachment
            ];
            
             //\Phpcmf\Service::C()->_json(0, $content);

            $rt = \Phpcmf\Service::L('upload')->base64_image($config);
            
            
            if (!$rt['code']) {
                exit(dr_array2string($rt));
            }

            // 附件归档
            $att = \Phpcmf\Service::M('Attachment')->save_data($rt['data']);
            if (!$att['code']) {
                exit(dr_array2string($att));
            }

            $data = [
                'id' => $att['code'],
                'url' => $rt['data']['url'],
            ];
            \Phpcmf\Service::C()->_json(1, dr_lang('上传成功'), $data);
        } else {
            \Phpcmf\Service::C()->_json(0, dr_lang('图片内容不规范'));
        }
    }
    
    
    
 //往频道添加一条新资源
    public function pushChannelResource()
    {
        $code = dr_safe_filename(\Phpcmf\Service::L('input')->get('code'));
        $channel  = $this->detectChannel();
        
         // 获取需要存储的数据
        $data = [
            'title' => \Phpcmf\Service::L('input')->post('title'),
            'description' => \Phpcmf\Service::L('input')->post('description'),
            'thumb' => \Phpcmf\Service::L('input')->post('coverUrl'),
            'channel_id' => $channel['id'],
            'author'=> '共产主义接班人'
            'updatetime'=>time()
        ];
        
         $isExsit = \Phpcmf\Service::M()->db->table('1_sharechannelresource')
            ->where('channel_id', $data['channel_id'])
            ->where('title',$data['title'])
            ->get()->getrowarray();
        if($isExsit){
            return $this->_json(50001, '名称已存在', [
                'time' => time(),
                'data' => null
            ]);
        }
        
        \Phpcmf\Service::M()->table('1_sharechannelresource')->insert($data);
        return $this->_json(200, '合集【'.$data['title'].'】创建成功', [
            'time' => time(),
            'data' => $data
        ]);
    }
    
    //往频道资源添加多条剧集
     public function pushItemsToResource(){
         $id = dr_safe_filename(\Phpcmf\Service::L('input')->get('id'));
         
         $isExsit = \Phpcmf\Service::M()->db->table('1_sharechannelresource')
      ->select('id,title,zyhjnr')
        ->where('id', $id)
        ->get()->getrowarray();
        if(!$isExsit){
            return $this->_json(404, '资源不存在', [
                'time' => time(),
                'data' => null
            ]);
        }
        
        if ($isExsit['zyhjnr']) {
            // 先将HTML实体解码，然后将JSON字符串解码为对象
            $decoded_json_string = html_entity_decode($isExsit['zyhjnr']);
            $isExsit['zyhjnr'] = json_decode($decoded_json_string);
         
        }else{
            $isExsit['zyhjnr'] = [];
            
           
        }
        $items =\Phpcmf\Service::L('input')->post('rawItems');
        
        $force =\Phpcmf\Service::L('input')->post('force');
          
        
        $updateData = dr_array2string(array_merge($isExsit['zyhjnr'],json_decode($items)));
        
         if($force=='true'){
              $updateData = $items;
          }
        
        \Phpcmf\Service::M()->db->table('1_sharechannelresource')->where('id', $id)->update(['zyhjnr' => $updateData]);
        
            return $this->_json(200, '批量添加资源成功', [
            'time' => time(),
            'data' => $updateData,
            'force'=> $force
        ]);
    }
    
    
      //往频道资源添加一条剧集
    public function pushItemToResource(){
         $id = dr_safe_filename(\Phpcmf\Service::L('input')->get('id'));
         
         $isExsit = \Phpcmf\Service::M()->db->table('1_sharechannelresource')
      ->select('id,title,zyhjnr')
        ->where('id', $id)
        ->get()->getrowarray();
        if(!$isExsit){
            return $this->_json(404, '资源不存在', [
                'time' => time(),
                'data' => null
            ]);
        }
        
        if ($isExsit['zyhjnr']) {
            // 先将HTML实体解码，然后将JSON字符串解码为对象
            $decoded_json_string = html_entity_decode($isExsit['zyhjnr']);
            $isExsit['zyhjnr'] = json_decode($decoded_json_string);
        }else{
            $isExsit['zyhjnr'] = [];
        }
            
        $toAdd = [
            'title' => \Phpcmf\Service::L('input')->post('title'),
            'origin' => \Phpcmf\Service::L('input')->post('origin'),
            'real' => \Phpcmf\Service::L('input')->post('real'),
            'type' =>\Phpcmf\Service::L('input')->post('type')
        ];
        array_push($isExsit['zyhjnr'], $toAdd);
        $updateData = dr_array2string($isExsit['zyhjnr']);
        
        
        \Phpcmf\Service::M()->db->table('1_sharechannelresource')->where('id', $id)->update(['zyhjnr' => $updateData]);

            return $this->_json(200, '添加资源成功', [
            'time' => time(),
            'data' => $isExsit['zyhjnr']
        ]);
    }
    
    
      //获取频道指定资源的详情（资源里面有多少剧集）
    public function getResourceDetail(){
        //$this->insertUser();
        $id = dr_safe_filename(\Phpcmf\Service::L('input')->get('id'));
     $isExsit = \Phpcmf\Service::M()->db->table('1_sharechannelresource')
      ->select('id,title,thumb,description,zyhjnr')
        ->where('id', $id)
        ->get()->getrowarray();
        if(!$isExsit){
            return $this->_json(404, '资源不存在', [
                'time' => time(),
                'data' => null
            ]);
        }
        
          if ($isExsit['zyhjnr']) {
                // 先将HTML实体解码，然后将JSON字符串解码为对象
                $decoded_json_string = html_entity_decode($isExsit['zyhjnr']);
                $isExsit['zyhjnr'] = json_decode($decoded_json_string,true);
            }else{
                $isExsit['zyhjnr'] = [];
            }
            
            // $index = 1;
            
            // $isExsit['zyhjnr'] = array_map(function ($item) {
            //     if (!$item['title']) {
            //         $item['title'] = $index;
            //     }
            //   $index++;
            //     return $item;
            // }, $isExsit['zyhjnr']);
            
            // for($i=0;$i <= count($isExsit['zyhjnr']);$i++){
            //     $item = $isExsit['zyhjnr'][$i];
            //     if ($item['title']) {
            //         $item['title'] = $isExsit['title'].'-'.$i;
            //     }
            // }
            
            
        return $this->_json(200, '合集【'.$isExsit['title'].'】已找到', [
            'time' => time(),
            'data' => $isExsit
        ]);
    }

     public function getNotify()
    {
       
         $data = \Phpcmf\Service::M()->db->table('1_xxtz')
         ->select('id,title,description,updatetime,active')
         ->orderBy('updatetime DESC')
            ->get()
            ->getResultArray();
       
        return $this->_json(200, '获取消息成功', [
            'time' => time(),
            'data' => $data
        ]);
    }
    
    
    
     public function pushwork(){
        $code = dr_safe_filename(\Phpcmf\Service::L('input')->get('code'));
        
        $channel = $this->detectChannel();
      
         $data = [
            'title' => \Phpcmf\Service::L('input')->post('subject'),
            'description' => \Phpcmf\Service::L('input')->post('description'),
            'suoshupindao' => $code,
            'yijiejue' => 0,
            'updatetime'=> time(),
            'author'=> '共产主义接班人'
         ];
         
            \Phpcmf\Service::M()->table('1_worklist')->insert($data);
        return $this->_json(200, '您的需求已提交，请耐心等候', [
            'time' => time()
        ]);
        
        
        
    }
    
     public function getWorkList(){
        $code = dr_safe_filename(\Phpcmf\Service::L('input')->get('code'));
         $data = \Phpcmf\Service::M()->db->table('1_worklist')
         ->select('id,title,description,updatetime,yijiejue')
         ->where('suoshupindao', $code)
         ->orderBy('updatetime DESC')
            ->get()
            ->getResultArray();
       
        return $this->_json(200, '获取工单成功', [
            'time' => time(),
            'data' => $data
        ]);
    }
}
